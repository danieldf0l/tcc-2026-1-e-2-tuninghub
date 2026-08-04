export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational === true;

  if (!isOperational) {
    console.error('[Erro Crítico]', err);
  } else {
    console.warn(`[Erro] ${statusCode} - ${err.message}`);
  }

  res.status(statusCode).json({
    status: 'error',
    message: isOperational ? err.message : 'Erro interno do servidor.',
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Rota ${req.method} ${req.originalUrl} não encontrada.`,
  });
};