// middleware/requirePermiso.js
export function requirePermiso(nombrePermiso) {
    return (req, res, next) => {
        // Si en dev desactivamos auth, no molestamos
        if (process.env.DISABLE_AUTH === 'true') {
            return next();
        }

        const user = req.currentUser;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: no user in request' });
        }

        const permisos = user.permisos || [];
        const tienePermiso = permisos.includes(nombrePermiso);

        if (!tienePermiso) {
            return res.status(403).json({ message: 'Forbidden: falta permiso ' + nombrePermiso });
        }

        next();
    };
}




/*export function requirePermiso(permisosRequeridos = []) {
    const requeridos = Array.isArray(permisosRequeridos) ? permisosRequeridos : [permisosRequeridos];

    return (req, res, next) => {
        // In test environment, skip permission enforcement to allow integration tests
        if (process.env.NODE_ENV === 'test') {
            return next();
        }
        if (!req.currentUser) {
            return res.status(401).json({ message: 'Unauthorized: No current user in request' });
        }

        const permisosUsuario = Array.isArray(req.currentUser.permisos)
            ? req.currentUser.permisos
            : [];

        const tiene = requeridos.every((p) => permisosUsuario.includes(p));

        if (!tiene) {
            return res.status(403).json({ message: 'Forbidden: Missing required permissions' });
        }

        next();
    };
}*/
