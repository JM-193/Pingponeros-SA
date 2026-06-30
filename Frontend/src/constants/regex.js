// Archivo donde se compilan las expresiones regulares usadas en toda la aplicación frontend

// Expresión regular para validar correos electrónicos de la UCR
export const EMAIL_REGEX = /^[a-zA-Z]+\.[a-zA-Z]+@[uU][cC][rR]\.[aA][cC]\.[cC][rR]$/

// Replica ValidationPatterns.SoloLetras (Backend): solo letras, con espacios alrededor opcionales.
export const SOLO_LETRAS_REGEX = /^(?:\s+|\s*[A-Za-záéíóúÁÉÍÓÚñÑüÜ]+\s*)$/