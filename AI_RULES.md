# AI Studio Application Rules

This document outlines the technical stack and coding guidelines for the PHKStudio Ecommerce application. Adhering to these rules ensures consistency, maintainability, and efficient development.

## Tech Stack Overview

*   **Frontend Framework**: React (v19.2.0) for building dynamic user interfaces.
*   **Language**: TypeScript (~v5.8.2) for type safety and improved code quality.
*   **Styling**: Tailwind CSS for utility-first styling, enabling rapid and consistent UI development.
*   **Icons**: Lucide React (v0.555.0) for a comprehensive set of customizable SVG icons.
*   **Build Tool**: Vite (v6.2.0) for a fast development experience and optimized builds.
*   **State Management**: Primarily React's `useState` and `useEffect` hooks for local and application-wide state.
*   **Data Persistence**: Browser's `localStorage` is used for mock data, user sessions, and cart management.
*   **UI Components**: Custom-built components, with a strong preference for `shadcn/ui` for future UI additions.
*   **Routing**: Currently managed by a custom `useState` hook in `App.tsx` for view switching, but `react-router-dom` is the designated library for future routing needs.
*   **Notifications**: A custom toast notification system is currently in place, but `react-hot-toast` is the preferred library for future toast implementations.

## Library Usage Rules

1.  **UI Components**:
    *   **Prioritize Shadcn/ui**: For all new UI elements (e.g., buttons, forms, dialogs, cards, inputs), always try to use components from the `shadcn/ui` library.
    *   **Custom Components**: Create new custom components in `src/components/` only when a suitable `shadcn/ui` component does not exist or requires extensive customization that would deviate from the library's design.
2.  **Styling**:
    *   **Tailwind CSS Only**: All styling must be done using Tailwind CSS utility classes. Avoid inline styles or separate CSS files unless absolutely necessary for global styles (e.g., `index.css`).
    *   **Responsiveness**: Ensure all designs are responsive by utilizing Tailwind's responsive utility classes.
3.  **Icons**:
    *   **Lucide React**: Use `lucide-react` for all icons throughout the application.
4.  **Routing**:
    *   **React Router**: For client-side navigation, `react-router-dom` should be used. All application routes must be defined and managed within `src/App.tsx`.
5.  **State Management**:
    *   **Local State**: For component-specific state, use React's `useState` and `useReducer` hooks.
    *   **Global State**: For more complex global state management, consider the React Context API.
6.  **Notifications**:
    *   **Toast Notifications**: While a custom toast system exists, for any new toast notifications or enhancements, use `react-hot-toast`.
7.  **Data Persistence**:
    *   **Local Storage**: Continue to use `localStorage` for mock data and client-side session persistence.
    *   **Backend Integration**: For any future backend integrations (e.g., Supabase, custom APIs), use the standard browser `fetch` API.
8.  **File Structure**:
    *   **Components**: All new reusable UI components should reside in `src/components/`.
    *   **Pages**: All main application views (pages) should be placed in `src/pages/`.
    *   **Utilities**: Helper functions and types should be organized in `src/utils/` and `types.ts` respectively.
    *   **New Files**: Always create a new, dedicated file for every new component or hook to maintain modularity.