export function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Not Found: ${req.originalUrl}`));
}

export function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  // Zod validation errors
  if (err?.name === "ZodError" || err?.issues) {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.issues?.map((issue) => ({
        field: issue.path?.[0] || "field",
        message: issue.message,
      })) || [],
    });
  }

  res.status(statusCode).json({
    message: err.message || "Server Error",
  });
}