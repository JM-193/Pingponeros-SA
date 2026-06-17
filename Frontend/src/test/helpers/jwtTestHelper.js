// src/test/helpers/jwtTestHelper.js

/**
 * Construct a minimal JWT with the given payload.
 * session.js does not verify the signature, it only decodes the payload, so 
 * the signature can be any string.
 *
 * @param {object} payload  Fields that will be in the JWT payload
 * @returns {string}  JWT with header.payload.fakesignature format
 */
export function buildJWT(payload) {
  const toBase64Url = (str) => {
    const bytes = new TextEncoder().encode(str)
    const binary = String.fromCodePoint(...bytes)
    return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
  }

  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = toBase64Url(JSON.stringify(payload))
  return `${header}.${body}.fakesignature`
}

/**
 * Returns the current time in epoch seconds (format that uses the `exp` field in JWT).
 * @returns {number}
 */
export const nowInSeconds = () => Math.floor(Date.now() / 1000)
