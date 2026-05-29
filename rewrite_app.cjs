const fs = require('fs');

let content = fs.readFileSync('C:/Users/navan/OneDrive/Documents/GitHub/OP-CS_CONNECT/src/App.tsx', 'utf8');

// Ensure lazy and Suspense are imported
if (!content.includes('import { lazy, Suspense }')) {
  content = content.replace("import { Routes, Route, Navigate } from 'react-router-dom'", "import { lazy, Suspense } from 'react'\nimport { Routes, Route, Navigate } from 'react-router-dom'");
}

// Regex to find all page imports
const importRegex = /import\s+([A-Za-z0-9_]+)\s+from\s+['"](\.\/(?:pages|components)\/[^'"]+)['"]/g;

let match;
const replacements = [];
while ((match = importRegex.exec(content)) !== null) {
  const [fullMatch, componentName, path] = match;
  // Skip layout/utility components
  if (componentName === 'DashboardLayout' || componentName === 'GenericPage' || componentName === 'NotFoundPage') continue;
  
  replacements.push({
    old: fullMatch,
    new: `const ${componentName} = lazy(() => import('${path}'))`
  });
}

replacements.forEach(r => {
  content = content.replace(r.old, r.new);
});

// Add Suspense wrap if not already there
if (!content.includes('<Suspense')) {
  content = content.replace('<Routes>', '<Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div></div>}>\n        <Routes>');
  content = content.replace('</Routes>', '</Routes>\n      </Suspense>');
}

fs.writeFileSync('C:/Users/navan/OneDrive/Documents/GitHub/OP-CS_CONNECT/src/App.tsx', content);
console.log('App.tsx rewritten with React.lazy');
