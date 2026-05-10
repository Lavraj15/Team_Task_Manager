import jwt from 'jsonwebtoken';

export const signToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};
