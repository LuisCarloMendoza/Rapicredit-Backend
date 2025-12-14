export function requireRole(rolesPermitidos = []) {
    const roles = (Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos])
        .map(r => String(r).toLowerCase().trim());

    if (process.env.DISABLE_AUTH === 'true') {
        return next();
    }

    return (req, res, next) => {
        if (!req.currentUser) {
            return res.status(401).json({ message: 'Unauthorized: No current user in request' });
        }
        const rolUsuario = String(req.currentUser.rol || '').toLowerCase().trim();
        if (!roles.includes(rolUsuario)) {
            return res.status(403).json({ message: 'Forbidden: Insufficient role' });
        }
        next();
    };
}