import express from 'express';
import listController from '../controllers/listController';

const router = express.Router();

router.get('/', listController.listAction);
router.get('/clear', listController.clearAction);
router.get('/export', listController.exportAction);

export default router;
