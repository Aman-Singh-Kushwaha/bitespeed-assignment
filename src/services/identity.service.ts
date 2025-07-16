
import { PrismaClient, Contact, LinkPrecedence } from '@prisma/client';

const prisma = new PrismaClient();

interface IdentifyRequestDto {
  email?: string;
  phoneNumber?: string;
}

export const identify = async ({ email, phoneNumber }: IdentifyRequestDto) => {
  const matchingContacts = await prisma.contact.findMany({
    where: {
      OR: [
        { email: email ?? undefined },
        { phoneNumber: phoneNumber ?? undefined },
      ],
    },
  });

  if (matchingContacts.length === 0) {
    const newContact = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkPrecedence: 'primary',
      },
    });
    return formatResponse([newContact]);
  }

  const linkedContacts = await getLinkedContacts(matchingContacts);

  const primaryContact = findPrimaryContact(linkedContacts);

  const newEmail = email && !linkedContacts.some(c => c.email === email);
  const newPhoneNumber = phoneNumber && !linkedContacts.some(c => c.phoneNumber === phoneNumber);

  if (newEmail || newPhoneNumber) {
    const secondaryContact = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkedId: primaryContact.id,
        linkPrecedence: 'secondary',
      },
    });
    linkedContacts.push(secondaryContact);
  }

  const primaryContactsToUpdate = linkedContacts.filter(c => c.id !== primaryContact.id && c.linkPrecedence === 'primary');

  if (primaryContactsToUpdate.length > 0) {
    await prisma.$transaction(async (tx) => {
      for (const contact of primaryContactsToUpdate) {
        await tx.contact.update({
          where: { id: contact.id },
          data: {
            linkedId: primaryContact.id,
            linkPrecedence: 'secondary',
          },
        });
      }
    });
  }

  const finalContacts = await getLinkedContacts([primaryContact]);

  return formatResponse(finalContacts);
};

const getLinkedContacts = async (contacts: Contact[]): Promise<Contact[]> => {
  const contactIds = contacts.map(c => c.id);
  const primaryContacts = contacts.filter(c => c.linkPrecedence === 'primary');
  const primaryContactIds = primaryContacts.map(c => c.id);

  const linkedContacts = await prisma.contact.findMany({
    where: {
      OR: [
        { id: { in: contactIds } },
        { linkedId: { in: primaryContactIds } },
      ],
    },
  });

  const allContactIds = new Set(linkedContacts.map(c => c.id));
  const allLinkedIds = new Set(linkedContacts.map(c => c.linkedId).filter(id => id !== null));

  const allIds = new Set([...allContactIds, ...allLinkedIds]);

  return prisma.contact.findMany({
      where: {
          OR: [
              { id: { in: Array.from(allIds) as number[] } },
              { linkedId: { in: Array.from(allIds) as number[] } },
          ]
      }
  });
};

const findPrimaryContact = (contacts: Contact[]): Contact => {
  return contacts.reduce((oldest, current) => {
    return new Date(current.createdAt) < new Date(oldest.createdAt) ? current : oldest;
  }, contacts[0]);
};

const formatResponse = (contacts: Contact[]) => {
  const primaryContact = findPrimaryContact(contacts);
  const emails = [...new Set(contacts.map(c => c.email).filter(Boolean))];
  const phoneNumbers = [...new Set(contacts.map(c => c.phoneNumber).filter(Boolean))];
  const secondaryContactIds = contacts
    .filter(c => c.id !== primaryContact.id)
    .map(c => c.id);

  return {
    contact: {
      primaryContactId: primaryContact.id,
      emails,
      phoneNumbers,
      secondaryContactIds,
    },
  };
};
