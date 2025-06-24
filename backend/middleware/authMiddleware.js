import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');
  console.log("Token recibido:", token); // Debug

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. No hay token' });
  }

  try {
    // Eliminar "Bearer " si el token lo incluye
    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
    
    console.log("Token decodificado:", decoded); // Debug

    // Asegurar que `req.user.id` esté bien definido
    if (!decoded.id) {
      return res.status(403).json({ message: 'Token válido pero sin ID de usuario' });
    }

    req.user = { id: decoded.id }; // Guardar solo el ID del usuario en `req.user`
    
    return next(); // Asegurar que se pase al siguiente middleware
  } catch (error) {
    console.error("Error verificando token:", error);
    return res.status(403).json({ message: 'Token no válido' });
  }
};

export default authMiddleware;
