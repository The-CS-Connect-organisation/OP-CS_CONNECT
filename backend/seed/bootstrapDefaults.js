import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

export const bootstrapDefaultUsers = async () => {
  const passwordHash = await bcrypt.hash('Password123', 12);
  const defaults = [
    { name: 'Admin User', email: 'admin@schoolsync.edu', role: 'admin' },
    { name: 'James Anderson', email: 'james@schoolsync.edu', role: 'teacher' },
    { name: 'Alex Thompson', email: 'alex@schoolsync.edu', role: 'student' },
    { name: 'Parent User', email: 'parent@schoolsync.edu', role: 'parent' },
  ];

  await Promise.all(
    defaults.map((entry) =>
      User.updateOne(
        { email: entry.email },
        {
          $set: {
            name: entry.name,
            role: entry.role,
            isActive: true,
            passwordHash,
          },
        },
        { upsert: true }
      )
    )
  );
};
