// File for compiling regular expressions used across the frontend application

// Regular expression for validating UCR email addresses
export const EMAIL_REGEX = /^[a-zA-Z]+\.[a-zA-Z]+@[uU][cC][rR]\.[aA][cC]\.[cC][rR]$/

// Mirrors ValidationPatterns.SoloLetras (Backend): letters only, optional surrounding whitespace.
export const SOLO_LETRAS_REGEX = /^\s*([A-Za-záéíóúÁÉÍÓÚñÑüÜ]+)?\s*$/