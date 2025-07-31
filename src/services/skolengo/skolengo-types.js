export var authTokenToSkolengoTokenSet = function (authToken) { return ({
    "access_token": authToken.accessToken,
    "id_token": authToken.idToken,
    "refresh_token": authToken.refreshToken,
    "token_type": authToken.tokenType,
    "expires_at": authToken.issuedAt + (authToken.expiresIn || 86400),
    "scope": authToken.scope,
}); };
export var toSkolengoDate = function (date) {
    return "".concat(date.getFullYear().toString().padStart(4, "0"), "-").concat((date.getMonth() + 1).toString().padStart(2, "0"), "-").concat((date.getDate()).toString().padStart(2, "0"));
};
