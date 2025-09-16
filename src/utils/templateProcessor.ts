import { Template, Variable, ValidationError } from '../types';

/**
 * Extract variable names from template content using React template syntax {{variable_name}}
 */
export function extractVariables(content: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const variables: string[] = [];
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const variableName = match[1].trim();
    if (variableName && !variables.includes(variableName)) {
      variables.push(variableName);
    }
  }
  
  return variables;
}

/**
 * Validate template content for missing variables
 */
export function validateTemplate(template: Template, availableVariables: Variable[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const requiredVariables = extractVariables(template.content);
  const availableVariableNames = availableVariables.map(v => v.name);
  
  for (const variableName of requiredVariables) {
    if (!availableVariableNames.includes(variableName)) {
      errors.push({
        field: 'content',
        message: `Variable '${variableName}' is not defined in settings`
      });
    }
  }
  
  return errors;
}

/**
 * Process template content by replacing variables with their values
 */
export function processTemplate(template: Template, variables: Variable[]): string {
  let processedContent = template.content;
  const variableMap = new Map(variables.map(v => [v.name, v.value]));
  
  // Replace all {{variable_name}} with actual values
  processedContent = processedContent.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
    const trimmedName = variableName.trim();
    return variableMap.get(trimmedName) || match; // Keep original if variable not found
  });
  
  return processedContent;
}

/**
 * Generate a unique ID for templates and variables
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Create a new template with default values
 */
export function createTemplate(title: string, content: string): Template {
  const now = new Date();
  return {
    id: generateId(),
    title,
    content,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Create a new variable with default values
 */
export function createVariable(name: string, value: string, description?: string): Variable {
  const now = new Date();
  return {
    id: generateId(),
    name,
    value,
    description,
    createdAt: now,
    updatedAt: now,
  };
}
