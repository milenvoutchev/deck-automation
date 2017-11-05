import express from 'express';
import researchController from '../controllers/researchController';
import ensureAuthenticated from '../helpers/ensureAuthenticated';

const router = express.Router();

const ROUTE_RESEARCH_JSON = '/json';

router.get(ROUTE_RESEARCH_JSON, ensureAuthenticated, researchController.jsonAction);

export default router;
