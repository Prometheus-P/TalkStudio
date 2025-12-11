// backend/src/services/excel_validator.js
// Excel data validation service (FR-6.3)

import { TEMPLATE_COLUMNS } from './excel_parser.js';
import { createModuleLogger } from '../utils/logger.js';

const logger = createModuleLogger('excel-validator');

/**
 * Validation error types
 */
export const ValidationErrorType = {
  REQUIRED: 'required',
  TYPE: 'type',
  FORMAT: 'format',
  LENGTH: 'length',
  DUPLICATE: 'duplicate',
};

/**
 * Validation rules for each field
 */
const VALIDATION_RULES = {
  authorId: {
    required: true,
    minLength: 1,
    maxLength: 100,
    pattern: null,
  },
  authorName: {
    required: true,
    minLength: 1,
    maxLength: 100,
    pattern: null,
  },
  content: {
    required: true,
    minLength: 1,
    maxLength: 4000, // Discord message limit
    pattern: null,
  },
  timestamp: {
    required: false,
    pattern: /^\d{4}-\d{2}-\d{2}(T|\s)\d{2}:\d{2}(:\d{2})?/,
    customValidator: (value) => {
      const date = new Date(value);
      return !isNaN(date.getTime());
    },
  },
  channelId: {
    required: false,
    minLength: 1,
    maxLength: 100,
  },
  channelName: {
    required: false,
    minLength: 1,
    maxLength: 100,
  },
};

/**
 * Validate a single row of data
 * @param {Object} row - Row data
 * @param {number} rowNumber - Row number (1-based)
 * @returns {Array} Array of validation errors
 */
export const validateRow = (row, rowNumber) => {
  const errors = [];

  Object.entries(VALIDATION_RULES).forEach(([field, rules]) => {
    const value = row[field];

    // Check required
    if (rules.required && (value === null || value === undefined || value === '')) {
      errors.push({
        row: rowNumber,
        field,
        type: ValidationErrorType.REQUIRED,
        message: `${field}은(는) 필수 항목입니다`,
        value,
      });
      return; // Skip other validations if required field is missing
    }

    // Skip validation if value is empty and not required
    if (value === null || value === undefined || value === '') {
      return;
    }

    // Check min length
    if (rules.minLength && String(value).length < rules.minLength) {
      errors.push({
        row: rowNumber,
        field,
        type: ValidationErrorType.LENGTH,
        message: `${field}은(는) 최소 ${rules.minLength}자 이상이어야 합니다`,
        value,
      });
    }

    // Check max length
    if (rules.maxLength && String(value).length > rules.maxLength) {
      errors.push({
        row: rowNumber,
        field,
        type: ValidationErrorType.LENGTH,
        message: `${field}은(는) 최대 ${rules.maxLength}자까지 허용됩니다`,
        value,
      });
    }

    // Check pattern
    if (rules.pattern && !rules.pattern.test(String(value))) {
      errors.push({
        row: rowNumber,
        field,
        type: ValidationErrorType.FORMAT,
        message: `${field} 형식이 올바르지 않습니다`,
        value,
      });
    }

    // Custom validation
    if (rules.customValidator && !rules.customValidator(value)) {
      errors.push({
        row: rowNumber,
        field,
        type: ValidationErrorType.FORMAT,
        message: `${field} 값이 유효하지 않습니다`,
        value,
      });
    }
  });

  return errors;
};

/**
 * Validate all rows and check for duplicates
 * @param {Array} rows - Array of row data
 * @returns {Object} { valid: boolean, errors: Array, stats: Object }
 */
export const validateAllRows = (rows) => {
  const allErrors = [];
  const seen = new Map(); // Track duplicates by content+authorId

  rows.forEach((row, index) => {
    const rowNumber = row._sourceRow || index + 2;

    // Validate row fields
    const rowErrors = validateRow(row, rowNumber);
    allErrors.push(...rowErrors);

    // Check for duplicates
    if (row.content && row.authorId) {
      const key = `${row.authorId}:${row.content.substring(0, 100)}`;
      if (seen.has(key)) {
        allErrors.push({
          row: rowNumber,
          field: 'content',
          type: ValidationErrorType.DUPLICATE,
          message: `행 ${seen.get(key)}과 중복된 메시지입니다`,
          value: row.content.substring(0, 50) + '...',
        });
      } else {
        seen.set(key, rowNumber);
      }
    }
  });

  // Group errors by row for better feedback
  const errorsByRow = allErrors.reduce((acc, error) => {
    if (!acc[error.row]) {
      acc[error.row] = [];
    }
    acc[error.row].push(error);
    return acc;
  }, {});

  const stats = {
    totalRows: rows.length,
    validRows: rows.length - Object.keys(errorsByRow).length,
    invalidRows: Object.keys(errorsByRow).length,
    totalErrors: allErrors.length,
    errorsByType: allErrors.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {}),
  };

  logger.info('Validation completed', stats);

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    errorsByRow,
    stats,
  };
};

/**
 * Format validation result for API response
 * @param {Object} validationResult - Result from validateAllRows
 * @returns {Object} Formatted response
 */
export const formatValidationResponse = (validationResult) => {
  const { valid, errors, errorsByRow, stats } = validationResult;

  // Limit errors to first 100 for response size
  const limitedErrors = errors.slice(0, 100);
  const hasMoreErrors = errors.length > 100;

  return {
    success: valid,
    summary: {
      totalRows: stats.totalRows,
      validRows: stats.validRows,
      invalidRows: stats.invalidRows,
      totalErrors: stats.totalErrors,
    },
    errors: limitedErrors.map((e) => ({
      row: e.row,
      field: e.field,
      type: e.type,
      message: e.message,
    })),
    hasMoreErrors,
    errorsByRow: Object.entries(errorsByRow)
      .slice(0, 50)
      .map(([row, rowErrors]) => ({
        row: parseInt(row),
        errors: rowErrors.map((e) => ({
          field: e.field,
          message: e.message,
        })),
      })),
  };
};

export default {
  validateRow,
  validateAllRows,
  formatValidationResponse,
  ValidationErrorType,
};
