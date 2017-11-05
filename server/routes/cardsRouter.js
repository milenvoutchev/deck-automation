import express from 'express';
import cardController from '../controllers/cardController';
import ensureAuthenticated from '../helpers/ensureAuthenticated';

const router = express.Router();

const ROUTE_CARD_LIST = '/';
const ROUTE_CARD_PURGE = '/purge';
const ROUTE_CARD_CREATE = '/create';
const ROUTE_CARD_EXPORT = '/export';
const ROUTE_CARD_UPDATE = '/:id';
const ROUTE_CARD_DELETE = '/:id/delete';

router.get(ROUTE_CARD_LIST, ensureAuthenticated, cardController.listAction);

router.get(ROUTE_CARD_PURGE, ensureAuthenticated, cardController.purgeAction);
router.post(ROUTE_CARD_PURGE, ensureAuthenticated, cardController.purgeAction);

router.post(ROUTE_CARD_CREATE, ensureAuthenticated, cardController.createAction);
router.get(ROUTE_CARD_CREATE, ensureAuthenticated, cardController.createAction);

router.get(ROUTE_CARD_EXPORT, ensureAuthenticated, cardController.exportAction);

router.get(ROUTE_CARD_UPDATE, ensureAuthenticated, cardController.updateAction);
router.post(ROUTE_CARD_UPDATE, ensureAuthenticated, cardController.updateAction);

router.get(ROUTE_CARD_DELETE, ensureAuthenticated, cardController.deleteAction);
router.post(ROUTE_CARD_DELETE, ensureAuthenticated, cardController.deleteAction);

export default router;
export {
  ROUTE_CARD_LIST,
  ROUTE_CARD_PURGE,
  ROUTE_CARD_CREATE,
  ROUTE_CARD_EXPORT,
  ROUTE_CARD_UPDATE,
};
