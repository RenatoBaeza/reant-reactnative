interface ValidationRules {
    required?: boolean;
    isNumeric?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  }
  
  interface FieldRules {
    [key: string]: ValidationRules;
  }
  
  interface ValidationResult {
    isValid: boolean;
    error: string | null;
  }
  
  export const validateField = (
    value: string, 
    fieldName: string, 
    rules: ValidationRules
  ): ValidationResult => {
    if (rules.required && !value) {
      return {
        isValid: false,
        error: `${fieldName} is required`
      };
    }
  
    if (rules.isNumeric && value && isNaN(Number(value))) {
      return {
        isValid: false,
        error: `${fieldName} must be a number`
      };
    }
  
    if (rules.minLength && value.length < rules.minLength) {
      return {
        isValid: false,
        error: `${fieldName} must be at least ${rules.minLength} characters`
      };
    }
  
    if (rules.maxLength && value.length > rules.maxLength) {
      return {
        isValid: false,
        error: `${fieldName} must be no more than ${rules.maxLength} characters`
      };
    }
  
    if (rules.pattern && !rules.pattern.test(value)) {
      return {
        isValid: false,
        error: `${fieldName} format is invalid`
      };
    }
  
    return {
      isValid: true,
      error: null
    };
  };
  
  export const validateForm = (
    formData: { [key: string]: string }, 
    rules: FieldRules
  ): string | null => {
    for (const [fieldName, fieldRules] of Object.entries(rules)) {
      const value = formData[fieldName];
      const validation = validateField(value, fieldName, fieldRules);
      
      if (!validation.isValid) {
        return validation.error;
      }
    }
    
    return null;
  };