import jwt from 'jsonwebtoken';

const validarToken = (req, res, next) => {
  next();
};

export { validarToken };
