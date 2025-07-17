"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.identify = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const identify = async ({ email, phoneNumber }) => {
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
exports.identify = identify;
const getLinkedContacts = async (contacts) => {
    // Find all primary contact IDs related to the initial set of matches.
    // This includes the IDs of the primary contacts themselves and the linkedIds of secondary contacts.
    const primaryContactIds = new Set();
    for (const contact of contacts) {
        if (contact.linkPrecedence === 'primary') {
            primaryContactIds.add(contact.id);
        }
        else if (contact.linkedId) {
            primaryContactIds.add(contact.linkedId);
        }
    }
    if (primaryContactIds.size === 0) {
        return contacts;
    }
    // Fetch all contacts that are either one of these primary contacts or are secondary contacts linked to one of them.
    const fullContactGroup = await prisma.contact.findMany({
        where: {
            OR: [
                { id: { in: Array.from(primaryContactIds) } },
                { linkedId: { in: Array.from(primaryContactIds) } },
            ],
        },
    });
    return fullContactGroup;
};
const findPrimaryContact = (contacts) => {
    return contacts.reduce((oldest, current) => {
        return new Date(current.createdAt) < new Date(oldest.createdAt) ? current : oldest;
    }, contacts[0]);
};
const formatResponse = (contacts) => {
    if (contacts.length === 0) {
        return { contact: {} };
    }
    const primaryContact = findPrimaryContact(contacts);
    const emails = Array.from(new Set(contacts.map(c => c.email).filter(Boolean)));
    const phoneNumbers = Array.from(new Set(contacts.map(c => c.phoneNumber).filter(Boolean)));
    // Ensure the primary contact's details are first, if they exist.
    const orderedEmails = [primaryContact.email, ...emails.filter(e => e !== primaryContact.email)].filter(Boolean);
    const orderedPhoneNumbers = [primaryContact.phoneNumber, ...phoneNumbers.filter(p => p !== primaryContact.phoneNumber)].filter(Boolean);
    const secondaryContactIds = contacts
        .map(c => c.id)
        .filter(id => id !== primaryContact.id);
    return {
        contact: {
            primaryContactId: primaryContact.id,
            emails: orderedEmails,
            phoneNumbers: orderedPhoneNumbers,
            secondaryContactIds,
        },
    };
};
