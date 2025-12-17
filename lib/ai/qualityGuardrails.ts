// Quality Guardrails for AI Content Generation

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface ContentCompletenessCheck {
  isComplete: boolean;
  missingFields: string[];
  completenessScore: number; // 0-100
}

// Validate JSON structure completeness
export function validateJSONCompleteness<T extends Record<string, any>>(
  data: T,
  requiredFields: string[],
  nestedChecks?: { field: string; required: string[] }[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check required fields
  for (const field of requiredFields) {
    if (!(field in data) || data[field] === null || data[field] === undefined) {
      errors.push(`Missing required field: ${field}`);
    } else if (typeof data[field] === 'string' && data[field].trim() === '') {
      warnings.push(`Empty required field: ${field}`);
    }
  }

  // Check nested structures
  if (nestedChecks) {
    for (const check of nestedChecks) {
      const fieldValue = data[check.field];
      if (Array.isArray(fieldValue)) {
        for (let i = 0; i < fieldValue.length; i++) {
          const item = fieldValue[i];
          for (const reqField of check.required) {
            if (!(reqField in item) || item[reqField] === null || item[reqField] === undefined) {
              errors.push(`Missing required field in ${check.field}[${i}]: ${reqField}`);
            }
          }
        }
      } else if (typeof fieldValue === 'object' && fieldValue !== null) {
        for (const reqField of check.required) {
          if (!(reqField in fieldValue) || fieldValue[reqField] === null || fieldValue[reqField] === undefined) {
            errors.push(`Missing required field in ${check.field}: ${reqField}`);
          }
        }
      }
    }
  }

  // Check for truncated content (common signs)
  const jsonString = JSON.stringify(data);
  if (jsonString.length < 100) {
    warnings.push('Content seems unusually short - may be truncated');
  }

  // Check for incomplete arrays/objects
  if (jsonString.endsWith('...') || jsonString.includes('"incomplete"')) {
    errors.push('Content appears to be truncated');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions: suggestions.length > 0 ? suggestions : ['Content structure looks good'],
  };
}

// Check content completeness for course data
export function checkCourseCompleteness(data: any): ContentCompletenessCheck {
  const missingFields: string[] = [];
  let completenessScore = 100;

  // Check top-level course structure
  if (!data.course) {
    missingFields.push('course');
    completenessScore -= 50;
  } else {
    if (!data.course.title) {
      missingFields.push('course.title');
      completenessScore -= 10;
    }
    if (!data.course.description) {
      missingFields.push('course.description');
      completenessScore -= 10;
    }
    if (!data.course.stages || !Array.isArray(data.course.stages)) {
      missingFields.push('course.stages');
      completenessScore -= 20;
    } else {
      // Check each stage
      data.course.stages.forEach((stage: any, index: number) => {
        if (!stage.title) {
          missingFields.push(`course.stages[${index}].title`);
          completenessScore -= 2;
        }
        if (!stage.objective) {
          missingFields.push(`course.stages[${index}].objective`);
          completenessScore -= 2;
        }
        if (!stage.content) {
          missingFields.push(`course.stages[${index}].content`);
          completenessScore -= 3;
        }
      });
    }
  }

  return {
    isComplete: missingFields.length === 0 && completenessScore >= 90,
    missingFields,
    completenessScore: Math.max(0, completenessScore),
  };
}

// Retry logic with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

// Validate and fix incomplete JSON
export function fixIncompleteJSON(jsonString: string): string {
  // Remove any text before first {
  const firstBrace = jsonString.indexOf('{');
  if (firstBrace > 0) {
    jsonString = jsonString.substring(firstBrace);
  }

  // Count braces to see if we need to close
  const openBraces = (jsonString.match(/\{/g) || []).length;
  const closeBraces = (jsonString.match(/\}/g) || []).length;
  const missing = openBraces - closeBraces;

  if (missing > 0) {
    // Try to intelligently close the JSON
    // Find the last incomplete property
    const lastColon = jsonString.lastIndexOf(':');
    const lastComma = jsonString.lastIndexOf(',');
    const lastQuote = jsonString.lastIndexOf('"');

    if (lastColon > lastComma && lastColon > lastQuote) {
      // We have an incomplete property value
      // Try to close arrays/objects properly
      if (jsonString.includes('"stages"') && !jsonString.includes(']')) {
        // Stages array is incomplete
        if (jsonString.includes('"stages": [')) {
          jsonString = jsonString.replace(/"stages": \[/, '"stages": []');
        }
      }
    }

    // Add missing closing braces
    jsonString += '}'.repeat(missing);
  }

  return jsonString;
}

