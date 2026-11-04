/**
 * @jest-environment node
 */
import * as oauth from 'oauth4webapi';

import { discordProvider } from './discordProvider';

describe('discordProvider', () => {
  it('accepts the iss parameter Discord sends on the OAuth callback', () => {
    const params = callbackParams('https://discord.com');

    expect(() =>
      oauth.validateAuthResponse(authorizationServer(), client(), params),
    ).not.toThrow();
  });

  it('still rejects a callback whose iss is not Discord', () => {
    const params = callbackParams('https://attacker.example');

    expect(() =>
      oauth.validateAuthResponse(authorizationServer(), client(), params),
    ).toThrow(/unexpected "iss"/);
  });
});

// Mirrors what Auth.js does at sign-in: it merges the user options over the
// provider defaults (@auth/core lib/utils/providers.js), then builds the
// authorization server from the issuer, falling back to a placeholder when
// there is none (lib/actions/callback/oauth/callback.js).
function authorizationServer(): oauth.AuthorizationServer {
  const issuer = discordProvider.options?.issuer ?? discordProvider.issuer;
  return { issuer: issuer ?? 'https://authjs.dev' };
}

function client(): oauth.Client {
  return { client_id: 'test-client' };
}

function callbackParams(iss: string): URLSearchParams {
  return new URLSearchParams({ code: 'test-code', iss });
}
