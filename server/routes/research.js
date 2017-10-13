import express from 'express';
import researchController from '../controllers/researchController';

const router = express.Router();

router.get('/', researchController.indexAction);
router.get('/json', researchController.jsonAction);

export default router;
