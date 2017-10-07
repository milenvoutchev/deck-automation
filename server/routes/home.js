import express from 'express';
import homeController from '../controllers/homeController';

const router = express.Router();

/* GET home page. */
router.get('/', homeController.indexAction);

export default router;
