/* eslint-disable import/prefer-default-export */

const getResponseSuccess = (data, message = '') => ({
  status: 'success',
  message,
  data: data || {},
});

const getResponseError = (message = '') => ({
  status: 'error',
  message,
});

export const respondCreated = (response, entity) => response.json(getResponseSuccess(entity, 'Created.'));
export const respondError = (response, error) => response.json(getResponseError(error));
