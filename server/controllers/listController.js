import List from '../models/List';
import { respondCreated } from '../helpers/responseHelper';

const listAction = (request, response) => {
  response.send('NOT IMPLEMENTED: listAction');
};

const exportAction = (request, response) => {
  response.send('NOT IMPLEMENTED: exportAction');
};

const clearAction = (request, response) => {
  response.send('NOT IMPLEMENTED: clearAction');
};

const createAction = (request, response, next) => {
  List.create(request.body)
    .then(list => respondCreated(response, list))
    .catch(error => next(error));
};

export default {
  listAction,
  exportAction,
  clearAction,
  createAction,
};
