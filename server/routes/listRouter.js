import express from 'express';
import listController from '../controllers/listController';

const router = express.Router();

router.get('/', listController.listAction);
router.get('/clear', listController.clearAction);
router.get('/export', listController.exportAction);
router.post('/create', listController.createAction);

export default router;
