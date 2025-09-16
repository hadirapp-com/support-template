export interface Template {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Variable {
  id: string;
  name: string;
  value: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateWithVariables extends Template {
  processedContent: string;
  variables: Variable[];
}

export interface StorageData {
  templates: Template[];
  variables: Variable[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ImportExportData {
  templates: Template[];
  variables: Variable[];
  version: string;
  exportedAt: string;
}
