import { Template, Variable, StorageData, ImportExportData } from '../types';

const STORAGE_KEYS = {
  TEMPLATES: 'support_templates',
  VARIABLES: 'support_variables',
} as const;

/**
 * Chrome storage API wrapper for templates and variables
 */
export class StorageService {
  /**
   * Get all templates from storage
   */
  static async getTemplates(): Promise<Template[]> {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.TEMPLATES);
      const templates = result[STORAGE_KEYS.TEMPLATES] || [];
      
      // Convert date strings back to Date objects
      return templates.map((template: any) => ({
        ...template,
        createdAt: new Date(template.createdAt),
        updatedAt: new Date(template.updatedAt),
      }));
    } catch (error) {
      console.error('Error getting templates:', error);
      return [];
    }
  }

  /**
   * Save templates to storage
   */
  static async saveTemplates(templates: Template[]): Promise<void> {
    try {
      await chrome.storage.local.set({
        [STORAGE_KEYS.TEMPLATES]: templates,
      });
    } catch (error) {
      console.error('Error saving templates:', error);
      throw error;
    }
  }

  /**
   * Get all variables from storage
   */
  static async getVariables(): Promise<Variable[]> {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.VARIABLES);
      const variables = result[STORAGE_KEYS.VARIABLES] || [];
      
      // Convert date strings back to Date objects
      return variables.map((variable: any) => ({
        ...variable,
        createdAt: new Date(variable.createdAt),
        updatedAt: new Date(variable.updatedAt),
      }));
    } catch (error) {
      console.error('Error getting variables:', error);
      return [];
    }
  }

  /**
   * Save variables to storage
   */
  static async saveVariables(variables: Variable[]): Promise<void> {
    try {
      await chrome.storage.local.set({
        [STORAGE_KEYS.VARIABLES]: variables,
      });
    } catch (error) {
      console.error('Error saving variables:', error);
      throw error;
    }
  }

  /**
   * Get all data (templates and variables)
   */
  static async getAllData(): Promise<StorageData> {
    const [templates, variables] = await Promise.all([
      this.getTemplates(),
      this.getVariables(),
    ]);

    return { templates, variables };
  }

  /**
   * Save all data (templates and variables)
   */
  static async saveAllData(data: StorageData): Promise<void> {
    await Promise.all([
      this.saveTemplates(data.templates),
      this.saveVariables(data.variables),
    ]);
  }

  /**
   * Clear all data
   */
  static async clearAllData(): Promise<void> {
    try {
      await chrome.storage.local.remove([
        STORAGE_KEYS.TEMPLATES,
        STORAGE_KEYS.VARIABLES,
      ]);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  /**
   * Export data as JSON
   */
  static async exportData(): Promise<string> {
    const data = await this.getAllData();
    const exportData: ImportExportData = {
      ...data,
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import data from JSON
   */
  static async importData(jsonData: string): Promise<void> {
    try {
      const importData: ImportExportData = JSON.parse(jsonData);
      
      // Validate the imported data structure
      if (!importData.templates || !importData.variables) {
        throw new Error('Invalid import data structure');
      }

      // Convert date strings back to Date objects
      const templates = importData.templates.map((template: any) => ({
        ...template,
        createdAt: new Date(template.createdAt),
        updatedAt: new Date(template.updatedAt),
      }));

      const variables = importData.variables.map((variable: any) => ({
        ...variable,
        createdAt: new Date(variable.createdAt),
        updatedAt: new Date(variable.updatedAt),
      }));

      await this.saveAllData({ templates, variables });
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Failed to import data. Please check the file format.');
    }
  }
}
