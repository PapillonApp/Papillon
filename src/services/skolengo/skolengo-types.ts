import type { DiscoveryDocument, TokenResponse } from "expo-auth-session";
import type { TokenSetParameters } from "openid-client";
import { School } from "scolengo-api/types/models/School";

export type SkolengoJWT = {
  sub: string
  oauthClientId: string
  clientName: string
  roles: string[]
  iss: string
  client_id: string
  grant_type: string
  permissions: unknown[]
  scope: string
  serverIpAddress: string
  longTermAuthenticationRequestTokenUsed: boolean
  state: string
  exp: number
  iat: number
  jti: string
  email: string
  clientIpAddress: string
  isFromNewLogin: boolean
  authenticationDate: string
  successfulAuthenticationHandlers: string
  profile: string
  userAgent: string
  given_name: string
  nonce: string
  credentialType: string
  aud: string
  authenticationMethod: string
  geoLocation: string
  scopes: string
  family_name: string
};

export type SkolengoTokenSet = TokenSetParameters;

export const authTokenToSkolengoTokenSet = (authToken: TokenResponse): SkolengoTokenSet => ({
  "access_token": authToken.accessToken,
  "id_token": authToken.idToken,
  "refresh_token": authToken.refreshToken,
  "token_type": authToken.tokenType,
  "expires_at": authToken.issuedAt + (authToken.expiresIn || 86400),
  "scope": authToken.scope,
});

export type SkolengoAuthConfig = {
  tokenSet: SkolengoTokenSet;
  discovery: DiscoveryDocument;
  school: School;
};

export const toSkolengoDate = (date: Date): string =>
  `${
    date.getFullYear().toString().padStart(4, "0")
  }-${
    (date.getMonth()+1).toString().padStart(2, "0")
  }-${
    (date.getDate()).toString().padStart(2, "0")
  }`;