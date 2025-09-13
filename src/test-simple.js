// Simple test to check if React is working
import React from 'react';
import ReactDOM from 'react-dom/client';

function TestApp() {
  return React.createElement('div', null, 'Hello World - React is working!');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(TestApp));
