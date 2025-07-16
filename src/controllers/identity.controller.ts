
import { Request, Response } from 'express';
import { identify } from '../services/identity.service';

export const handleIdentify = async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ message: 'Email or phone number must be provided.' });
  }

  try {
    const result = await identify({ email, phoneNumber });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
};
