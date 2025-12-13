import { admin } from '../firebase.js';         // asumiendo que así importas firebase admin
import { userService } from '../services/user.service.js'; // si tienes esto

export async function verifyFirebaseToken(req, res, next) {
  // 🔧 MODO DESARROLLO: si está activado, no validamos nada
  if (process.env.DISABLE_AUTH === 'true') {
    // Si quieres, puedes simular un usuario:
    req.currentUser = {
      id: 'dev-user',
      nombre: 'Usuario Dev',
      permisos: ['Gestionar clientes', 'Ver/Buscar cliente', 'Gestionar préstamos', 'Ver/Buscar solicitud'],
    };
    return next();
  }

  // 🔐 MODO REAL (para cuando el login funcione de verdad)
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = header.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    const user = await userService.getUserByFirebaseUid(decodedToken.uid);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    req.currentUser = user;
    next();
  } catch (error) {
    console.error('Error verifying Firebase token', error);
    res.status(401).json({ message: 'Unauthorized' });
  }
}
