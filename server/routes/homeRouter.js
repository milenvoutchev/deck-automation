import express from 'express';
import homeController from '../controllers/homeController';
import ensureAuthenticated from '../helpers/ensureAuthenticated';

const router = express.Router();

const ROUTE_HOME = '/';

router.get(ROUTE_HOME, ensureAuthenticated, homeController.indexAction);

export default router;
