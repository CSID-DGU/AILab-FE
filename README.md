# DGU AI Lab Frontend

A modern React application built with Vite for fast development and optimized builds.

## Features

- ⚡️ **Vite** - Lightning fast build tool
- ⚛️ **React 19** - Latest React with modern features
- 🎨 **Hot Module Replacement** - Instant updates during development
- 📦 **ES Modules** - Modern JavaScript module system
- 🔧 **ESLint** - Code linting for better code quality
- 🎯 **React Router** - Client-side routing for navigation
- 💨 **Tailwind CSS** - Utility-first CSS framework for styling

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository or use this project
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Create a production build:

```bash
npm run build
```

### Preview

Preview the production build locally:

```bash
npm run preview
```

### Linting

Run ESLint to check code quality:

```bash
npm run lint
```

## Project Structure

```
├── public/          # Static assets
├── src/            # Source code
│   ├── components/ # React components (Navbar, etc.)
│   ├── pages/      # Page components (HomePage, ExamplePage)
│   ├── App.jsx     # Main App component with routing
│   ├── main.jsx    # Application entry point
│   └── index.css   # Global styles with Tailwind
├── index.html      # HTML template
├── package.json    # Dependencies and scripts
├── vite.config.js  # Vite configuration
├── tailwind.config.js # Tailwind CSS configuration
└── postcss.config.js  # PostCSS configuration
```

## Available Pages

- **Home (/)** - Main page with a counter example
- **Example (/example)** - Simple example page with text

## Contributing

1. Follow the coding standards defined in `.eslintrc`
2. Use meaningful commit messages
3. Test your changes before submitting
