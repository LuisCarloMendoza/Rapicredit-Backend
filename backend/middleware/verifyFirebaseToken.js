import { admin } from '../firebase.js';
import { userService } from '../services/user.service.js';

export async function verifyFirebaseToken(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = header.split(' ')[1];

    // 1) Verificamos el token con Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);

    // 2) Buscamos el usuario en nuestra BD por uid
    const dbUser = await userService.getUserByUid(decodedToken.uid);

    if (!dbUser) {
      return res.status(401).json({
        message: 'Unauthorized: User not found in database',
      });
    }

    // 3) Adjuntamos ambos al request
    req.firebaseUser = decodedToken;
    req.currentUser = dbUser; // contiene rol, permisos, etc.

    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
}
