export function requirePermiso(permisosRequeridos = []) {
    const requeridos = Array.isArray(permisosRequeridos) ? permisosRequeridos : [permisosRequeridos];

    return (req, res, next) => {
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
}
