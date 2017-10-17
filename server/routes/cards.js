import express from 'express';
import cardController from '../controllers/cardController';

const router = express.Router();

const ROUTE_CARD_LIST = '/';
const ROUTE_CARD_PURGE = '/purge';
const ROUTE_CARD_CREATE = '/create';
const ROUTE_CARD_EXPORT = '/export';
const ROUTE_CARD_UPDATE = '/:id';
const ROUTE_CARD_DELETE = '/:id/delete';

router.get(ROUTE_CARD_LIST, cardController.listAction);

router.get(ROUTE_CARD_PURGE, cardController.purgeAction);
router.post(ROUTE_CARD_PURGE, cardController.purgeAction);

router.post(ROUTE_CARD_CREATE, cardController.createAction);
router.get(ROUTE_CARD_CREATE, cardController.createAction);

router.get(ROUTE_CARD_EXPORT, cardController.exportAction);

router.get(ROUTE_CARD_UPDATE, cardController.updateAction);
router.post(ROUTE_CARD_UPDATE, cardController.updateAction);

router.get(ROUTE_CARD_DELETE, cardController.deleteAction);

export default router;
export {
  ROUTE_CARD_LIST,
  ROUTE_CARD_PURGE,
  ROUTE_CARD_CREATE,
  ROUTE_CARD_EXPORT,
  ROUTE_CARD_UPDATE,
};
