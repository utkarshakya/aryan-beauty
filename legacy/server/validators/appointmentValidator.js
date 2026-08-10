import { body, param } from 'express-validator';

// Validate appointment creation
export const validateCreateAppointment = [
  body('serviceId')
    .notEmpty().withMessage('Service ID is required')
    .isMongoId().withMessage('Invalid Service ID'),
  body('startTime')
    .notEmpty().withMessage('Start time is required')
    .isISO8601().withMessage('Invalid ISO date format')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Start time must be in the future');
      }
      return true;
    }),
  body('notes')
    .optional()
    .isLength({ max: 100 }).withMessage('Notes must be ≤ 500 characters'),
];

// Validate appointment update
export const validateUpdateAppointment = [
  param('id')
    .isMongoId().withMessage('Invalid appointment ID'),
  body().custom(({ req }) => {
    const updatableFields = ['serviceId', 'startTime', 'notes'];
    const hasUpdates = updatableFields.some(field => req.body[field] !== undefined);
    if (!hasUpdates) {
      throw new Error('At least one field must be updated');
    }
    return true;
  }),
  body('serviceId')
    .optional()
    .isMongoId().withMessage('Invalid Service ID'),
  body('startTime')
    .optional()
    .isISO8601().withMessage('Invalid ISO date format')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Start time must be in the future');
      }
      return true;
    }),
  body('notes')
    .optional()
    .isLength({ max: 100 }).withMessage('Notes must be ≤ 500 characters'),
];