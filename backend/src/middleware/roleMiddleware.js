/**
 * Role-Based Access Control Middleware
 *
 * Enforces role authorization strictly on protected routes.
 *
 * @param  {...string} allowedRoles - 'OWNER', 'WORKER'
 * @returns {Function} Express middleware function
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before role verification'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      let customMessage = `Forbidden: Access restricted to ${allowedRoles.join(' or ')} accounts only.`;
      
      if (allowedRoles.length === 1 && allowedRoles[0] === 'OWNER') {
        customMessage = 'Only owners can perform this action.';
      } else if (allowedRoles.length === 1 && allowedRoles[0] === 'WORKER') {
        customMessage = 'Only workers can perform this action.';
      }

      return res.status(403).json({
        success: false,
        message: customMessage
      });
    }

    next();
  };
};

export default requireRole;
