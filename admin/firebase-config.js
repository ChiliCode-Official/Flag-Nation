/**
 * La configuración web de Firebase identifica el proyecto, pero las reglas
 * de Firestore son las que protegen los datos. Pega aquí el objeto entregado
 * por Firebase Console > Project settings > Your apps > Web app.
 */
export const firebaseConfig = null;

/** Correos autorizados como capa adicional de seguridad en la interfaz. */
export const adminEmails = [];

// Client-ID público de Imgur. Se configura en el despliegue, no se guarda en Firestore.
export const imgurClientId = null;
