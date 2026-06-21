const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminTimetable.tsx', 'utf8');

const fallbackData = `
      if (usersData.length === 0) {
        usersData = [
          { id: 't1', name: 'Mr. Smith', email: 'smith@school.com', role: 'teacher' },
          { id: 't2', name: 'Ms. Johnson', email: 'johnson@school.com', role: 'teacher' }
        ];
      }
      if (coursesData.length === 0) {
        coursesData = [
          { id: 'c1', name: 'Mathematics 101', code: 'MTH101' },
          { id: 'c2', name: 'Physics 201', code: 'PHY201' },
          { id: 'c3', name: 'English Lit', code: 'ENG101' },
          { id: 'c4', name: 'Chemistry Lab', code: 'CHE101' },
          { id: 'c5', name: 'Computer Science', code: 'CS101' }
        ];
      }
      if (roomsData.length === 0) {
        roomsData = [
          { id: 'r1', name: 'Room 101' },
          { id: 'r2', name: 'Room 102' },
          { id: 'r3', name: 'Science Lab' }
        ];
      }
`;

content = content.replace(
  "const timetableData = timetableResult.status === 'fulfilled' ? extractArray(timetableResult.value) : [];",
  "let timetableData = timetableResult.status === 'fulfilled' ? extractArray(timetableResult.value) : [];\n" + fallbackData
);

// We need to change const to let
content = content.replace("const usersData =", "let usersData =");
content = content.replace("const coursesData =", "let coursesData =");
content = content.replace("const roomsData =", "let roomsData =");

fs.writeFileSync('src/pages/admin/AdminTimetable.tsx', content);
