import Discord from 'next-auth/providers/discord';

/**
 * Discord now returns an `iss` parameter on the OAuth callback (RFC 9207).
 * Auth.js's Discord provider declares no issuer, so Auth.js compares `iss`
 * against its `https://authjs.dev` placeholder and rejects every sign-in.
 * Remove the override once nextauthjs/next-auth#12694 ships in a release.
 */
export const DISCORD_ISSUER = 'https://discord.com';

export const discordProvider = Discord({ issuer: DISCORD_ISSUER });
