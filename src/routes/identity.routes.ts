
import { Router } from 'express';
import { handleIdentify } from '../controllers/identity.controller';

const router = Router();

router.post('/identify', handleIdentify);

export default router;
