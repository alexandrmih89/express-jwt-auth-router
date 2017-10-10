import jsonwebtoken from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET;

export const signAccessToken = (req) => jsonwebtoken.sign({
  id: req.user.id,
  provider: req.user.provider
}, jwtSecret, {
  expiresIn: 300
});

export const signRefreshToken = (req) => jsonwebtoken.sign({
  id: req.user.id,
  session: req.user.id,
  provider: req.user.provider
}, jwtSecret);
