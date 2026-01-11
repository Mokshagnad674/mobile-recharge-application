// Role-based middleware
const checkRole = (requiredRole) => {
  return (req, res, next) => {
    const userRole = req.headers['user-role'] || req.user?.role;
    
    if (userRole !== requiredRole) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    next();
  };
};

// Usage in routes
app.use('/admin/*', checkRole('admin'));
app.use('/user/*', checkRole('user'));

module.exports = { checkRole };