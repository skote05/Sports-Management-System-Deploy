import { validationResult } from 'express-validator';

/**
 * Middleware to handle validation errors from express-validator
 * Returns formatted error response if validation fails
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Return validation errors in a structured format
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};
