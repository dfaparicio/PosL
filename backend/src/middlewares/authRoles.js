const validarRol = (...roles) => {
  return (req, res, next) => {
    next();
  };
};

export { validarRol };
