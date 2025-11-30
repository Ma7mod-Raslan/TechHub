// backend/src/middleware/roles.js

/**
 * allowRoles(...allowedRoles)
 * middleware factory that checks req.user.role and allows only listed roles.
 * Usage: allowRoles("instructor"), allowRoles("student","instructor")
 */
export function allowRoles(...allowedRoles) {
  return (req, res, next) => {
    // if req.user missing => unauthorized
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden. Insufficient permissions." });
    }

    next();
  };
}
