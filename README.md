<<<<<<< HEAD
# 📊 Job Application Tracker

A web application to manage and track job applications in a simple and structured way.

---

## 🚀 Overview

Job Application Tracker is a frontend-focused project built to help users organize their job search process.

The app allows users to create, update, and manage job applications while keeping all relevant information in one place, replacing the need for spreadsheets or scattered notes.

---

## 🎯 Features

* Create, update, and delete job applications
* Track key information:

  * Company
  * Role
  * Status (applied, interview, rejected, etc.)
  * Application date
  * Location
* Add optional job URL and notes
* View all applications in a structured table

---

## 🧱 Tech Stack

* React
* TypeScript
* Tailwind CSS

---

## 📂 Project Structure

```
job-application-tracker/
├── frontend/
└── README.md
```

---

## 🛠️ Getting Started

### 1. Clone the repository

```
git clone https://github.com/ReySlash/job-application-tracker.git
cd job-application-tracker
```

### 2. Install dependencies

```
cd frontend
npm install
npm run dev
```

---

## 📌 Project Purpose

This project is part of my portfolio as a web developer, focused on building practical applications with clean UI and solid state management.

---

## 👨‍💻 Author

Built by Rey
=======
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
>>>>>>> cb0ae0c (Initial commit)
