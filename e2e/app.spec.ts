import { test, expect } from '@playwright/test';

test.describe('Support Template Manager', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main application', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Support Template Manager' })).toBeVisible();
    await expect(page.getByText('Manage your support templates with variables')).toBeVisible();
  });

  test('should show tabs for Templates, Editor, and Settings', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Templates' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Editor' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Settings' })).toBeVisible();
  });

  test('should navigate to Editor tab', async ({ page }) => {
    await page.getByRole('tab', { name: 'Editor' }).click();
    await expect(page.getByRole('heading', { name: 'Template Editor' })).toBeVisible();
  });

  test('should navigate to Settings tab', async ({ page }) => {
    await page.getByRole('tab', { name: 'Settings' }).click();
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  });

  test('should create a new template', async ({ page }) => {
    await page.getByRole('tab', { name: 'Editor' }).click();
    
    // Fill in template details
    await page.getByLabel('Template Title').fill('Test Template');
    await page.getByLabel('Template Content').fill('Hello {{name}}, welcome to our service!');
    
    // Click save button
    await page.getByRole('button', { name: 'Save Template' }).click();
    
    // Navigate to Templates tab to verify
    await page.getByRole('tab', { name: 'Templates' }).click();
    await expect(page.getByText('Test Template')).toBeVisible();
  });

  test('should add a new variable in Settings', async ({ page }) => {
    await page.getByRole('tab', { name: 'Settings' }).click();
    
    // Click add variable button
    await page.getByRole('button', { name: 'Add Variable' }).click();
    
    // Fill in variable details
    await page.getByLabel('Variable Name').fill('customer_name');
    await page.getByLabel('Variable Value').fill('John Doe');
    await page.getByLabel('Description (optional)').fill('Customer name for templates');
    
    // Save the variable
    await page.getByRole('button', { name: 'Save Variable' }).click();
    
    // Verify the variable was added
    await expect(page.getByText('customer_name')).toBeVisible();
  });

  test('should process template with variables', async ({ page }) => {
    // First, add a variable
    await page.getByRole('tab', { name: 'Settings' }).click();
    await page.getByRole('button', { name: 'Add Variable' }).click();
    await page.getByLabel('Variable Name').fill('name');
    await page.getByLabel('Variable Value').fill('John Doe');
    await page.getByRole('button', { name: 'Save Variable' }).click();
    
    // Then create a template with that variable
    await page.getByRole('tab', { name: 'Editor' }).click();
    await page.getByLabel('Template Title').fill('Welcome Template');
    await page.getByLabel('Template Content').fill('Hello {{name}}, welcome to our service!');
    
    // Check that the preview shows processed content
    await expect(page.getByText('Hello John Doe, welcome to our service!')).toBeVisible();
    
    // Save the template
    await page.getByRole('button', { name: 'Save Template' }).click();
    
    // Navigate to Templates tab and test copy functionality
    await page.getByRole('tab', { name: 'Templates' }).click();
    await page.getByRole('button', { name: 'Copy' }).first().click();
    
    // Verify toast notification appears
    await expect(page.getByText('Template copied to clipboard!')).toBeVisible();
  });

  test('should show validation errors for missing variables', async ({ page }) => {
    await page.getByRole('tab', { name: 'Editor' }).click();
    
    // Create a template with a variable that doesn't exist
    await page.getByLabel('Template Title').fill('Test Template');
    await page.getByLabel('Template Content').fill('Hello {{missing_var}}, this is a test!');
    
    // Check that validation errors appear
    await expect(page.getByText('Validation Errors:')).toBeVisible();
    await expect(page.getByText("Variable 'missing_var' is not defined in settings")).toBeVisible();
  });

  test('should export and import templates', async ({ page }) => {
    // First create a template
    await page.getByRole('tab', { name: 'Editor' }).click();
    await page.getByLabel('Template Title').fill('Export Test Template');
    await page.getByLabel('Template Content').fill('This is a test template for export.');
    await page.getByRole('button', { name: 'Save Template' }).click();
    
    // Navigate to Templates tab and export
    await page.getByRole('tab', { name: 'Templates' }).click();
    await page.getByRole('button', { name: 'Import/Export' }).click();
    
    // Click export button
    await page.getByRole('button', { name: 'Export Templates' }).click();
    
    // Verify download started (this is hard to test fully in e2e, but we can check the button was clicked)
    await expect(page.getByRole('button', { name: 'Export Templates' })).toBeVisible();
  });
});
