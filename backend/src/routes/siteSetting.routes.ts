import { Router } from 'express';
import {
    createSiteSetting,
    getSiteSetting,
    updateSiteSetting,
    deleteSiteSetting,
} from '../controllers/siteSetting.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRole } from '../middlewares/authorize.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', getSiteSetting);
router.post('/', authorizeRole('admin', 'lead'), createSiteSetting);
router.put('/', authorizeRole('admin', 'lead'), updateSiteSetting);
router.delete('/', authorizeRole('admin', 'lead'), deleteSiteSetting);

export default router;
