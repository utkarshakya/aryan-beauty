import { body, param } from 'express-validator';

// Service Categories (update based on your needs)
const allowedCategories = ['Hair', 'Skincare', 'Nails', 'Makeup'];

export const validateCreateService = [
  body('name')
    .trim()
    .notEmpty().withMessage('Service name is required')
    .isLength({ min: 3, max: 50 }).withMessage('Name must be 3-50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Description must be ≤ 500 characters'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('duration')
    .notEmpty().withMessage('Duration is required')
    .isInt({ min: 15, max: 180 }).withMessage('Duration must be 15-180 minutes'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(allowedCategories).withMessage(`Category must be one of: ${allowedCategories.join(', ')}`),
];

export const validateUpdateService = [
  param('id')
    .isMongoId().withMessage('Invalid service ID'),
  body().custom(({ req }) => {
    const updatableFields = ['name', 'price', 'duration', 'category', 'description'];
    const hasUpdates = updatableFields.some(field => req.body[field] !== undefined);
    if (!hasUpdates) {
      throw new Error('At least one field must be updated');
    }
    return true;
  }),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('Name must be 3-50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Description must be ≤ 500 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 180 }).withMessage('Duration must be 15-180 minutes'),
  body('category')
    .optional()
    .isIn(allowedCategories).withMessage(`Category must be one of: ${allowedCategories.join(', ')}`),
];