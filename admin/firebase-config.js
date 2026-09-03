/**
 * La configuración web de Firebase identifica el proyecto, pero las reglas
 * de Firestore son las que protegen los datos. Pega aquí el objeto entregado
 * por Firebase Console > Project settings > Your apps > Web app.
 */
export const firebaseConfig = {
  apiKey: "AIzaSyCK0xZs52qEaGqY-lKobLJqvHN_u4NsWaQ",
  authDomain: "flag-nation-mx.firebaseapp.com",
  projectId: "flag-nation-mx",
  storageBucket: "flag-nation-mx.firebasestorage.app",
  messagingSenderId: "659602254296",
  appId: "1:659602254296:web:6d077450effdbbc6ba2aad",
  measurementId: "G-ZTFHJTP0Y7"
};

/** Correos autorizados como capa adicional de seguridad en la interfaz. */
export const adminEmails = [];

// Client-ID público de Imgur. Se configura en el despliegue, no se guarda en Firestore.
export const imgurClientId = null;
