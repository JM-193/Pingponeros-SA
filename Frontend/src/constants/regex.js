// Archivo donde se compilan las expresiones regulares usadas en toda la aplicación frontend

// Expresión regular para validar correos electrónicos de la UCR
export const EMAIL_REGEX = /^[a-zA-Z]+\.[a-zA-Z]+@[uU][cC][rR]\.[aA][cC]\.[cC][rR]$/

// Replica ValidationPatterns.SoloLetras (Backend): solo letras, con espacios alrededor opcionales.
export const SOLO_LETRAS_REGEX = /^(?:\s+|\s*[A-Za-záéíóúÁÉÍÓÚñÑüÜ]+\s*)$/

// Replica ValidationPatterns.SoloLetrasYPuntuacion (Backend): letras (con acentos),
// dígitos, espacios y puntuación básica (punto, coma y dos puntos). Sin otros símbolos.
export const SOLO_LETRAS_PUNTUACION_REGEX = /^[A-Za-z0-9áéíóúÁÉÍÓÚñÑüÜ.,:\s]+$/

// Replica ValidationPatterns.TextoSeguro (Backend): texto libre que admite letras, dígitos,
// espacios y puntuación de redacción (. , : ( ) ¿ ? ¡ ! / % -), pero bloquea los caracteres
// usados en inyecciones SQL (comillas, punto y coma, barra invertida, < > = *). Para
// justificaciones. La protección principal sigue siendo el backend parametrizado.
export const TEXTO_SEGURO_REGEX = /^[A-Za-z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,:()¿?¡!/%-]*$/