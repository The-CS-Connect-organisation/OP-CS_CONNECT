const fs = require('fs');
let content = fs.readFileSync('../OP-CS_CONNECT_-Backend-/src/index.ts', 'utf8');

const importStr = `
import classesRoutes from './routes/classes';
import sectionsRoutes from './routes/sections';
import subjectsRoutes from './routes/subjects';
`;
content = content.replace("import authRoutes from './routes/auth';", "import authRoutes from './routes/auth';" + importStr);

const useStr = `
app.use('/api/v1/classes', classesRoutes);
app.use('/api/v1/sections', sectionsRoutes);
app.use('/api/v1/subjects', subjectsRoutes);
app.use('/api/v1/students', studentsRoutes);
`;
content = content.replace("app.use('/api/auth', authRoutes);", "app.use('/api/auth', authRoutes);" + useStr);

fs.writeFileSync('../OP-CS_CONNECT_-Backend-/src/index.ts', content);
