
import { Request, Response, NextFunction } from 'express';
import { identify } from '../services/identity.service';

export const handleIdentify = async (req: Request, res: Response, next: NextFunction) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ message: 'Email or phone number must be provided.' });
  }

  try {
    const result = await identify({ email, phoneNumber });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};
