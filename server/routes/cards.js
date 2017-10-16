import express from 'express';
import cardController from '../controllers/cardController';

const router = express.Router();

router.get('/', cardController.listAction);
router.get('/purge', cardController.purgeAction);
router.post('/purge', cardController.purgeAction);
router.post('/create', cardController.createAction);
router.get('/export', cardController.exportAction);
router.get('/:id', cardController.updateAction);
router.post('/:id', cardController.updateAction);

export default router;
