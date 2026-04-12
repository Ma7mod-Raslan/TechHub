// backend/src/middleware/roles.js

export function allowRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!req.user.role) {
      return res.status(403).json({ error: "User role not found" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Allowed roles: ${allowedRoles.join(", ")}`
      });
    }

    next();
  };
}