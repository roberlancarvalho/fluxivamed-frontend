# Copilot Instructions for FluxivaMed Frontend

Welcome to the FluxivaMed Frontend codebase! This document provides essential guidelines for AI coding agents to be productive in this project. Please follow these instructions to maintain consistency and quality.

## Project Overview

This is an Angular-based frontend application generated using Angular CLI version 20.2.1. The project follows standard Angular conventions for structure and development workflows.

### Key Directories and Files
- **`src/`**: Contains the main application source code.
  - **`app/`**: Houses the core application logic, including components, routes, and styles.
  - **`main.ts`**: Entry point for the application.
  - **`styles.scss`**: Global styles for the application.
- **`angular.json`**: Angular CLI configuration file.
- **`package.json`**: Lists project dependencies and scripts.
- **`tsconfig.json`**: TypeScript configuration.

## Development Workflow

### Starting the Development Server
To start the local development server, run:
```bash
ng serve
```
Access the application at `http://localhost:4200/`. The server reloads automatically on file changes.

### Building the Project
To build the project for production:
```bash
ng build
```
Artifacts are stored in the `dist/` directory.

### Running Tests
- **Unit Tests**: Run with Karma using:
  ```bash
  ng test
  ```
- **End-to-End Tests**: Run with:
  ```bash
  ng e2e
  ```
  Note: Choose an appropriate e2e framework as Angular CLI does not include one by default.

## Project-Specific Conventions

### Component Structure
- Follow Angular's best practices for component-based architecture.
- Use the `ng generate` command to scaffold new components, directives, or services.
  ```bash
  ng generate component component-name
  ```

### Styling
- Use SCSS for styles. Global styles are defined in `styles.scss`.
- Component-specific styles should reside in their respective `.scss` files.

### Routing
- Define application routes in `app.routes.ts`.
- Use lazy loading for feature modules to optimize performance.

## Integration Points

### External Dependencies
- Dependencies are managed via `package.json`. Use `npm install` to add new packages.
- Ensure compatibility with Angular CLI version 20.2.1.

### Cross-Component Communication
- Use Angular services for shared state and communication between components.
- Avoid direct DOM manipulation; use Angular's templating and binding features.

## Additional Notes
- Refer to the [Angular CLI Documentation](https://angular.dev/tools/cli) for detailed command references.
- Maintain consistency with the existing code style and structure.

By adhering to these guidelines, you can ensure that contributions align with the project's standards and practices.