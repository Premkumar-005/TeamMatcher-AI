import jwt from 'jsonwebtoken';

export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'teammatcher_jwt_secret_key_production_ready_2026',
    { expiresIn: '7d' }
  );
};

export default generateToken;
