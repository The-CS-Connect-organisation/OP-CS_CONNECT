export const PERMISSIONS = {
  USERS_MANAGE: 'users.manage',
  FEES_MANAGE: 'fees.manage',
  FEES_PAY: 'fees.pay',
  ATTENDANCE_MARK: 'attendance.mark',
  GRADES_MANAGE: 'grades.manage',
  ASSIGNMENTS_MANAGE: 'assignments.manage',
  NOTES_MANAGE: 'notes.manage',
  ANNOUNCEMENTS_MANAGE: 'announcements.manage',
};

const ROLE_PERMISSIONS = {
  admin: new Set([
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.FEES_MANAGE,
    PERMISSIONS.ATTENDANCE_MARK,
    PERMISSIONS.GRADES_MANAGE,
    PERMISSIONS.ASSIGNMENTS_MANAGE,
    PERMISSIONS.NOTES_MANAGE,
    PERMISSIONS.ANNOUNCEMENTS_MANAGE,
  ]),
  teacher: new Set([
    PERMISSIONS.ATTENDANCE_MARK,
    PERMISSIONS.GRADES_MANAGE,
    PERMISSIONS.ASSIGNMENTS_MANAGE,
    PERMISSIONS.NOTES_MANAGE,
  ]),
  student: new Set([PERMISSIONS.FEES_PAY]),
};

export const hasPermission = (user, permission) => {
  const role = user?.role;
  return role ? ROLE_PERMISSIONS[role]?.has(permission) ?? false : false;
};

