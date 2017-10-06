import express from 'express';
import cardController from '../controllers/cardController';

const router = express.Router();

router.get('/', cardController.listAction);

router.get('/create', cardController.createAction);
router.post('/create', cardController.createAction);

router.get('/:id', cardController.detailAction);

export default router;
