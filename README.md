# Support Template Manager Chrome Extension

A Chrome extension for managing support templates with variable substitution. This extension helps support agents create and manage reusable templates with dynamic variables.

## Features

- **Template Management**: Create, edit, and delete support templates
- **Variable System**: Use variables in templates with `{{variable_name}}` syntax
- **Variable Management**: Add, edit, and delete variables in settings
- **Copy to Clipboard**: One-click copy of processed templates
- **Import/Export**: Backup and restore templates as JSON files
- **Real-time Preview**: See how templates look with variables replaced
- **Validation**: Automatic validation of template variables

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run build
   ```
4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Run tests:
   ```bash
   npm test
   ```

4. Run tests with coverage:
   ```bash
   npm run test:coverage
   ```

### Building

```bash
npm run build
```

## Usage

### Creating Templates

1. Go to the **Editor** tab
2. Enter a template title and content
3. Use `{{variable_name}}` syntax for variables
4. Click **Save Template**

### Managing Variables

1. Go to the **Settings** tab
2. Click **Add Variable**
3. Enter variable name, default value, and optional description
4. Click **Save Variable**

### Using Templates

1. Go to the **Templates** tab
2. Click **Copy** on any template to copy the processed content to clipboard
3. Click the eye icon to preview the template with variables replaced

### Import/Export

1. Go to the **Templates** tab
2. Click **Import/Export**
3. Use the **Export** tab to download your templates as JSON
4. Use the **Import** tab to restore templates from a JSON file

## Template Syntax

Variables in templates use double curly braces:

```
Hello {{customer_name}},

Thank you for contacting us regarding {{issue_type}}. 
Your ticket number is {{ticket_id}}.

Best regards,
{{agent_name}}
```

## API Reference

### Types

- `Template`: Represents a support template
- `Variable`: Represents a template variable
- `ValidationError`: Represents template validation errors

### Utilities

- `extractVariables(content)`: Extract variable names from template content
- `validateTemplate(template, variables)`: Validate template variables
- `processTemplate(template, variables)`: Replace variables with values
- `StorageService`: Chrome storage API wrapper

## Testing

The project includes comprehensive unit tests for:

- Template processing utilities
- Storage service
- Clipboard functionality
- React components

Run tests with:
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details
