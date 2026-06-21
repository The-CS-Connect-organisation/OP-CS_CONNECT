const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminClassroom.tsx', 'utf8');

// The file has a local `apiFetch` function:
// async function apiFetch(path: string, options: RequestInit = {}) {
//   const res = await fetch(`/api/v1${path}`, {

content = content.replace(
  "async function apiFetch(path: string, options: RequestInit = {}) {\n  const res = await fetch(`/api/v1${path}`, {",
  "import { api } from '../../lib/api';\nasync function localApiFetch(path: string, options: RequestInit = {}) {\n  const res = await fetch(`https://op-csconnect-backend-production.up.railway.app/api/v1${path}`, {"
);
content = content.replace(/apiFetch\(/g, "localApiFetch(");
fs.writeFileSync('src/pages/admin/AdminClassroom.tsx', content);
