import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './routes/AppRouter'; // 👈 استيراد الـRouter اللي عملناه
import './index.css';

// 1. تحديد الـRoot Element
const rootElement = document.getElementById('root');

if (rootElement) {
  // 2. إنشاء الـRoot
  const root = ReactDOM.createRoot(rootElement);

  // 3. عرض الـAppRouter (الذي يحتوي على جميع الصفحات والـRouting)
  root.render(
    <React.StrictMode>
      <AppRouter /> 
    </React.StrictMode>,
  );
} else {
  console.error("Failed to find the root element with ID 'root'");
}
