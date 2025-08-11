# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview

This is a Vite + React project using JavaScript (not TypeScript). The project is set up for modern frontend development with hot module replacement and optimized builds.

## Code Style Guidelines

- Use functional components with hooks
- Use ES6+ features and modern JavaScript
- Follow React best practices
- Use CSS modules or styled-components for styling
- Keep components small and focused on single responsibilities

## Development Preferences

- Prefer arrow functions for components
- Use destructuring for props and state
- Use modern React patterns (hooks over class components)
- Follow semantic HTML practices
- Write clean, readable code with meaningful variable names

## API Response Handling Guidelines

### HTTP Status Code Based Success/Failure

- **HTTP 200**: Request successful
- **Non-HTTP 200**: Request failed
- Always check `response.status === 200` to determine success

### Error Message Handling

- **DO NOT**: Use server error messages directly in UI
- **DO**: Create user-friendly error messages on the client side
- **Example**:

  ```javascript
  // Good - Client-defined user-friendly message
  if (response.status === 200) {
    // Handle success
  } else {
    setAlert({
      type: "error",
      message:
        "이메일 또는 비밀번호가 올바르지 않습니다. 입력하신 정보를 다시 확인해주세요.",
    });
  }

  // Bad - Using server error message directly
  setAlert({
    type: "error",
    message: error.message, // Don't do this
  });
  ```

### Security Considerations

- Never expose internal server error details to users
- Provide clear, actionable feedback without revealing system internals
- Use generic error messages for authentication failures
