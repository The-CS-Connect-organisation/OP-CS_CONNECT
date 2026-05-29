const fs = require('fs');

let content = fs.readFileSync('OP-CS_CONNECT/src/App.tsx', 'utf8');

// Ensure lazy and Suspense are imported
if (!content.includes('import { lazy, Suspense }')) {
  content = content.replace("import { Routes, Route, Navigate } from 'react-router-dom'", "import { lazy, Suspense } from 'react'\nimport { Routes, Route, Navigate } from 'react-router-dom'");
}

// Regex to find all page imports: import ComponentName from './pages/...' or './components/...'
// We exclude imports from 'react' or 'react-router-dom' or stores
const importRegex = /import\s+([A-Za-z0-9_]+)\s+from\s+['"](\.\/(?:pages|components)\/[^'"]+)['"]/g;

let match;
while ((match = importRegex.exec(content)) !== null) {
  const [fullMatch, componentName, path] = match;
  // Skip DashboardLayout as it wraps routes
  if (componentName === 'DashboardLayout') continue;
  
  const replacement = `const ${componentName} = lazy(() => import('${path}'))`;
  content = content.replace(fullMatch, replacement);
}

// Add Suspense fallback around Routes
content = content.replace('<Routes>', '<Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div></div>}>\n      <Routes>');
content = content.replace('</Routes>', '</Routes>\n      </Suspense>');

fs.writeFileSync('OP-CS_CONNECT/src/App.tsx', content);
console.log('App.tsx rewritten with React.lazy');
