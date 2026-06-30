// src/test/helpers/jwtTestHelper.js

/**
 * Construye un JWT mínimo con el payload indicado.
 * session.js no verifica la firma, solo decodifica el payload, por lo que
 * la firma puede ser cualquier cadena.
 *
 * @param {object} payload  Campos que estarán en el payload del JWT
 * @returns {string}  JWT con formato header.payload.fakesignature
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
 * Devuelve la hora actual en segundos epoch (formato que usa el campo `exp` en el JWT).
 * @returns {number}
 */
export const nowInSeconds = () => Math.floor(Date.now() / 1000)
