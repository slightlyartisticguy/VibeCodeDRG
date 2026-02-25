# Project general coding guidelines

## Dev stack
- Use next.js with React and TypeScript
- Use tailwindcss for styling
- Use ESLint and Prettier for code formatting and linting
- use tanstack query for data fetching and state management
- use zod for schema validation
- Use shadcn/ui for data visualization components

## Naming Conventions
- Use PascalCase for component names, interfaces, and type aliases
- Use camelCase for variables, functions, and methods
- Prefix private class members with underscore (_)
- Use ALL_CAPS for constants

## Code Quality
- Use meaningful variable and function names that clearly describe their purpose
- Include helpful comments for complex logic
- Add error handling for user inputs and API calls

## File Organization
- Group related components, utilities, and styles into separate folders 
- Keep files focused on a single responsibility or feature
- Use index files for easier imports when necessary

## Dependencies
- Keep dependencies up to date
- Avoid installing packages with known vulnerabilities
- Document why specific dependencies are needed

## Documentation 
- Maintain an updated ROBOTREADME.md with setup instructions and other important information
- Use JSDoc comments for functions and classes to describe their purpose and parameters

## Chat responses
- Always provide a response when you are unable to do something that is asked. Particularly for API data retrieval, outline what limitations the provided tools have and what alternatives the user can try.
- Provide an alert when rate limits are hit on an API service and don't implement any workarounds without approval.