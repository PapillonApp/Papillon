const unavailableError = () => new Error('AppScho service is temporarily unavailable');

const INSTANCES = [];

async function loginWithCredentials() {
  throw unavailableError();
}

async function loginWithOAuth() {
  throw unavailableError();
}

async function refreshOAuthTokenWithUser() {
  throw unavailableError();
}

async function getPlanning() {
  return [];
}

async function getNewsFeed() {
  return [];
}

function getCASURL() {
  return '';
}

module.exports = {
  INSTANCES,
  loginWithCredentials,
  loginWithOAuth,
  refreshOAuthTokenWithUser,
  getPlanning,
  getNewsFeed,
  getCASURL,
};
