# Video Editor AI - React Frontend

A ChatGPT-style interface for AI-powered video editing, built with React and Tailwind CSS.

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Header.js        # Main header with sidebar toggle
│   ├── Sidebar.js       # Sidebar with conversation history
│   ├── Message.js       # Individual message bubble
│   ├── MessageList.js   # Container for all messages
│   ├── MessageInput.js  # Chat input form
│   ├── FileUpload.js    # Drag & drop file upload
│   ├── QuickActions.js  # Video editing action buttons
│   ├── LoadingIndicator.js # Loading animation
│   └── index.js         # Component exports
├── hooks/               # Custom React hooks
│   └── useMessages.js   # Message management logic
├── App.js              # Main application component
├── index.js            # React entry point
└── index.css           # Tailwind CSS imports
```

## 🎯 Features

### Components
- **Sidebar**: Collapsible sidebar with conversation history
- **MessageList**: Displays chat messages with auto-scroll
- **Message**: Individual message bubbles with avatars
- **FileUpload**: Drag & drop file upload with file type validation
- **QuickActions**: Pre-defined video editing action buttons
- **MessageInput**: Chat input with send functionality
- **Header**: Main header with sidebar toggle and file status

### Custom Hooks
- **useMessages**: Manages message state, loading states, and message operations

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm start
   ```

3. **Open browser**: Navigate to `http://localhost:3000`

## 🎨 Design Principles

### Component Architecture
- **Single Responsibility**: Each component has one clear purpose
- **Reusability**: Components are designed to be reusable across the app
- **Props Interface**: Clear prop interfaces for easy integration
- **Accessibility**: ARIA labels and semantic HTML

### State Management
- **Custom Hooks**: Business logic separated into custom hooks
- **Local State**: Component-specific state managed locally
- **Props Drilling**: Minimal prop drilling with focused component responsibilities

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Responsive Design**: Mobile-first responsive design
- **Consistent Spacing**: Using Tailwind's spacing scale
- **Component Isolation**: Each component manages its own styling

## 🔧 Development

### Adding New Components
1. Create component file in `src/components/`
2. Export from `src/components/index.js`
3. Import and use in parent components

### Adding New Hooks
1. Create hook file in `src/hooks/`
2. Follow React hooks naming convention (`use*`)
3. Return object with related state and functions

### Styling Guidelines
- Use Tailwind utility classes
- Maintain consistent spacing and colors
- Follow mobile-first responsive design
- Use semantic HTML elements

## 🚀 Future Enhancements

- [ ] Add TypeScript support
- [ ] Implement real file upload functionality
- [ ] Add backend API integration
- [ ] Add unit tests for components
- [ ] Add error boundaries
- [ ] Implement conversation persistence
- [ ] Add keyboard shortcuts
- [ ] Add dark mode support

## 📦 Dependencies

- **React 18.2.0**: UI library
- **Tailwind CSS 3.4.0**: Styling framework
- **React Scripts 5.0.1**: Build tools
- **PostCSS 8.4.31**: CSS processing
- **Autoprefixer 10.4.16**: CSS vendor prefixes
