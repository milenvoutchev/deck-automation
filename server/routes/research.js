import express from 'express';
import researchController from '../controllers/researchController';

const router = express.Router();

router.get('/:word', researchController.indexAction);

export default router;
