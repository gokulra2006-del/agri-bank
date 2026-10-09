// Centralized Error Handling Middleware

export function errorHandler(err, req, res, next) {
  console.error('[AgriSahay Server Error]', err);

  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';

  res.status(statusCode).json({
    success: false,
    error: errorCode,
    message: err.message || 'An unexpected server error occurred.',
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
}
