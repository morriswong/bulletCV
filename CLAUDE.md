# BulletCV Project Guidelines

## Build Commands
- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run start` - Start the production server

## Code Style

### TypeScript
- Use strict mode typing (enabled in tsconfig.json)
- Type all component props, state variables, and function parameters/returns
- Use React.FC for functional components with explicit return types

### Formatting
- Use consistent casing in file names (enforced in tsconfig.json)
- Components use PascalCase (e.g., DropDown.tsx)
- Utility/helper functions use camelCase
- Follow React hooks naming convention (useXxx)

### Patterns
- Use "use client" directive for client components
- Use Next.js App Router conventions
- Organize imports: React/Next imports first, then external libraries, then local components
- Always handle loading and error states for async operations

### Error Handling
- Use try/catch blocks for API calls
- Provide user-friendly error messages using toast notifications

This file is used as guidance for Claude and other AI coding assistants working on this repository.