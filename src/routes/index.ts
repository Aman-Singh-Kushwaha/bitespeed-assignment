
import { Router } from 'express';
import identityRoutes from './identity.routes';

const router = Router();

router.use(identityRoutes);

export default router;
