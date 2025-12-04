export function requireRole(rolesPermitidos = []) {
    const roles = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];

    return (req, res, next) => {
        if (!req.currentUser) {
            return res.status(401).json({ message: 'Unauthorized: No current user in request' });
        }

        const rolUsuario = (req.currentUser.rol || '').toLowerCase();

        if (!roles.includes(rolUsuario)) {
            return res.status(403).json({ message: 'Forbidden: Insufficient role' });
        }

        next();
    };
}
