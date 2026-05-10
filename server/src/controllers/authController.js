import { User } from '../models/User.js';
import { signToken } from '../utils/token.js';

const userPayload = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email
});

export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password });

    res.status(201).json({
      user: userPayload(user),
      token: signToken(user.id)
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      user: userPayload(user),
      token: signToken(user.id)
    });
  } catch (error) {
    next(error);
  }
};

export const me = (req, res) => {
  res.json({ user: userPayload(req.user) });
};
