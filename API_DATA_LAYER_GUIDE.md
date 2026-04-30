# API Data Layer Guide

## Overview

The API Data Layer provides a centralized, abstracted interface for all API communication between frontend and backend. It includes:

- **Request/Response Management** - Standardized HTTP communication
- **Caching** - Automatic response caching with TTL
- **Retry Logic** - Exponential backoff for failed requests
- **Error Handling** - Comprehensive error management
- **Request Deduplication** - Prevents duplicate concurrent requests
- **Backend Data Abstraction** - Centralized Firebase operations

---

## Architecture

### Frontend Data Layer (`apiDataLayer.js`)
```
Component
    ↓
useStore Hook / Custom Hook
    ↓
API Data Layer (Frontend)
    ├─ Cache Management
    ├─ Request Deduplication
    ├─ Retry Logic
    └─ Error Handling
    ↓
HTTP Request
    ↓
Backend API
```

### Backend Data Layer (`apiDataLayer.js`)
```
Controller
    ↓
Backend Data Layer
    ├─ Firebase Operations
    ├─ Cache Management
    ├─ Data Transformation
    └─ Error Handling
    ↓
Firebase Realtime Database
```

---

## Frontend API Data Layer

### Installation

```javascript
import { teacherApi, studentApi, authApi, apiUtils } from './services/apiDataLayer';
```

### Configuration

```javascript
// Set API base URL (default: http://localhost:5000/api)
// In .env:
REACT_APP_API_URL=http://localhost:5000/api
```

### Features

#### 1. **Automatic Caching**
- GET requests cached for 5 minutes
- Cache key: `method:endpoint`
- Automatic cache invalidation on mutations

```javascript
// First call - fetches from API
const data = await teacherApi.getDashboard();

// Second call (within 5 min) - returns cached data
const data = await teacherApi.getDashboard(); // [Cache Hit]
```

#### 2. **Retry Logic**
- Automatic retry on network errors
- Exponential backoff (1s, 2s, 4s)
- Max 3 retries by default
- No retry on client errors (4xx)

```javascript
// Automatically retries on failure
const result = await teacherApi.getClassAnalytics('class-1');
```

#### 3. **Request Deduplication**
- Prevents duplicate concurrent requests
- Returns same promise for identical requests

```javascript
// Both requests return same promise
Promise.all([
  teacherApi.getDashboard(),
  teacherApi.getDashboard(),
]); // Only 1 API call made
```

#### 4. **Error Handling**
- Standardized error responses
- HTTP status codes preserved
- Detailed error messages

```javascript
try {
  const result = await teacherApi.getClassAnalytics('invalid-id');
} catch (error) {
  console.error(error.status); // 404
  console.error(error.message); // "HTTP 404: Not Found"
}
```

### Teacher API Methods

#### Attendance
```javascript
// Get class attendance
const attendance = await teacherApi.getClassAttendance('class-1', '2026-04-29');

// Mark attendance
await teacherApi.markAttendance('class-1', '2026-04-29', [
  { studentId: 'student-1', status: 'present' },
  { studentId: 'student-2', status: 'absent' },
]);
```

#### Grading
```javascript
// Get grading templates
const templates = await teacherApi.getGradingTemplates('Math');

// Create template
await teacherApi.createGradingTemplate({
  name: 'Math Rubric',
  subject: 'Math',
  criteria: [
    { name: 'Accuracy', maxPoints: 50 },
    { name: 'Clarity', maxPoints: 30 },
  ],
});

// Bulk grade submissions
await teacherApi.bulkGradeSubmissions('assignment-1', [
  { submissionId: 'sub-1', marks: 85, feedback: 'Good work' },
  { submissionId: 'sub-2', marks: 92, feedback: 'Excellent' },
]);
```

#### Analytics
```javascript
// Get class analytics
const analytics = await teacherApi.getClassAnalytics('class-1', 'Term1');

// Get class trends
const trends = await teacherApi.getClassTrends('class-1', 6); // Last 6 months
```

#### Progress Tracking
```javascript
// Get student progress
const progress = await teacherApi.getStudentProgress('student-1', 'Term1');

// Get student timeline
const timeline = await teacherApi.getStudentTimeline('student-1');
```

#### Notifications
```javascript
// Create notification
await teacherApi.createNotification({
  type: 'assignment_due',
  title: 'Assignment Due',
  message: 'Math homework due tomorrow',
  targetUsers: ['student-1', 'student-2'],
});

// Get notifications
const notifications = await teacherApi.getNotifications(1, 20);

// Get unread count
const count = await teacherApi.getUnreadCount();
```

#### Class Notes
```javascript
// Create note
await teacherApi.createNote('class-1', {
  title: 'Chapter 5 Notes',
  content: 'Important concepts...',
  category: 'lecture',
  tags: ['chapter5', 'important'],
}, files);

// Get notes
const notes = await teacherApi.getNotes('class-1', 'lecture', 'chapter5');

// Update note
await teacherApi.updateNote('note-1', {
  title: 'Updated Title',
  content: 'Updated content',
});

// Delete note
await teacherApi.deleteNote('note-1');
```

#### Messaging
```javascript
// Get message templates
const templates = await teacherApi.getMessageTemplates('reminder');

// Create template
await teacherApi.createMessageTemplate({
  name: 'Assignment Reminder',
  category: 'reminder',
  body: 'Please submit your assignment by {{dueDate}}',
});

// Send message
await teacherApi.sendMessage('student-1', null, 'Hello!', 'template-1');
```

#### Reports
```javascript
// Generate class report
const report = await teacherApi.generateClassReport('class-1', 'json', 'Term1');

// Generate student report
const report = await teacherApi.generateStudentReport('student-1', 'csv', 'Term1');
```

#### Dashboard
```javascript
// Get dashboard
const dashboard = await teacherApi.getDashboard();
```

#### Data Export
```javascript
// Export attendance
await teacherApi.exportAttendance('class-1', '2026-04-01', '2026-04-30', 'csv');

// Export grades
await teacherApi.exportGrades('class-1', 'Math', 'Term1', 'csv');

// Export students
await teacherApi.exportStudents('class-1', 'csv');
```

#### Insights
```javascript
// Get insights
const insights = await teacherApi.getInsights();

// Get productivity score
const score = await teacherApi.getProductivityScore();
```

#### Advanced Search
```javascript
// Get filter options
const options = await teacherApi.getFilterOptions('assignments');

// Perform advanced search
const results = await teacherApi.performAdvancedSearch('math', ['assignments'], {
  students: { grade: '10' },
});
```

#### Keyboard Shortcuts
```javascript
// Get shortcuts
const shortcuts = await teacherApi.getShortcuts();

// Update shortcut
await teacherApi.updateShortcut('mark_attendance', ['Ctrl', 'A']);

// Track shortcut usage
await teacherApi.trackShortcut('mark_attendance');

// Get shortcut stats
const stats = await teacherApi.getShortcutStats(7); // Last 7 days
```

#### AI Features
```javascript
// Analyze attendance
const analysis = await teacherApi.analyzeAttendance('student-1', 'class-1');

// Identify learning gaps
const gaps = await teacherApi.identifyLearningGaps('student-1', 'class-1');

// Predict performance
const prediction = await teacherApi.predictPerformance('student-1', 'class-1');

// Recommend assignment
const recommendation = await teacherApi.recommendAssignment('class-1', 'Math');

// Generate class insights
const insights = await teacherApi.generateClassInsights('class-1', 'Term1');

// Generate feedback
const feedback = await teacherApi.generateFeedback('sub-1', 85, 100, rubric);
```

### Student API Methods

```javascript
// Get assignments
const assignments = await studentApi.getAssignments('class-1');

// Get assignment details
const details = await studentApi.getAssignmentDetails('assignment-1');

// Submit assignment
await studentApi.submitAssignment('assignment-1', {
  content: 'My submission',
  files: [file1, file2],
});

// Get attendance
const attendance = await studentApi.getAttendance('class-1');

// Get grades
const grades = await studentApi.getGrades('class-1');

// Get notes
const notes = await studentApi.getNotes('class-1');

// Get progress
const progress = await studentApi.getProgress();
```

### Auth API Methods

```javascript
// Login
const result = await authApi.login('teacher@school.com', 'password');

// Signup
const result = await authApi.signup({
  name: 'John Doe',
  email: 'john@school.com',
  password: 'password',
  role: 'teacher',
});

// Logout
await authApi.logout();

// Get current user
const user = await authApi.getCurrentUser();

// Update profile
await authApi.updateProfile({
  name: 'Jane Doe',
  phone: '+91 9876543210',
});
```

### Utility Functions

```javascript
import { apiUtils } from './services/apiDataLayer';

// Clear all cache
apiUtils.clearCache();

// Clear specific cache
apiUtils.clearCache('assignments');

// Get cached data
const data = apiUtils.getCachedData('GET:/teacher/dashboard');

// Set cached data
apiUtils.setCachedData('key', data);

// Get auth token
const token = apiUtils.getAuthToken();

// Set auth token
apiUtils.setAuthToken('new-token');

// Remove auth token
apiUtils.removeAuthToken();
```

---

## Backend Data Layer

### Installation

```javascript
import { teacherDataLayer, dataLayerUtils } from './services/apiDataLayer';
```

### Features

#### 1. **Automatic Caching**
- 5-minute cache TTL
- Cache key: `resource:id:filter`
- Automatic invalidation on mutations

#### 2. **Data Abstraction**
- Encapsulates Firebase operations
- Handles data transformation
- Manages relationships

#### 3. **Error Handling**
- Try-catch with logging
- Meaningful error messages
- Graceful degradation

### Teacher Data Layer Methods

#### Attendance
```javascript
// Get class attendance
const attendance = await teacherDataLayer.getClassAttendance('class-1', '2026-04-29');

// Mark attendance
await teacherDataLayer.markAttendance('class-1', '2026-04-29', entries, 'teacher-1');
```

#### Grading
```javascript
// Get grading templates
const templates = await teacherDataLayer.getGradingTemplates('teacher-1', 'Math');

// Create grading template
const template = await teacherDataLayer.createGradingTemplate(templateData, 'teacher-1');

// Bulk grade submissions
const result = await teacherDataLayer.bulkGradeSubmissions(
  'assignment-1',
  grades,
  'template-1',
  'teacher-1'
);
```

#### Analytics
```javascript
// Get class analytics
const analytics = await teacherDataLayer.getClassAnalytics('class-1', 'Term1');
```

#### Progress Tracking
```javascript
// Get student progress
const progress = await teacherDataLayer.getStudentProgress('student-1', 'Term1');
```

#### Notifications
```javascript
// Get notifications
const notifications = await teacherDataLayer.getNotifications('teacher-1', 1, 20);

// Create notification
const notification = await teacherDataLayer.createNotification(notificationData, 'teacher-1');
```

#### Dashboard
```javascript
// Get teacher dashboard
const dashboard = await teacherDataLayer.getTeacherDashboard('teacher-1');
```

### Utility Functions

```javascript
import { dataLayerUtils } from './services/apiDataLayer';

// Clear all cache
dataLayerUtils.clearCache();

// Clear specific cache
dataLayerUtils.clearCache('analytics');

// Get cached data
const data = dataLayerUtils.getCachedData('analytics:class-1:Term1');

// Set cached data
dataLayerUtils.setCachedData('key', data);
```

---

## Usage Examples

### Frontend Component

```javascript
import { useEffect, useState } from 'react';
import { teacherApi } from '../services/apiDataLayer';

export const ClassAnalytics = ({ classId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await teacherApi.getClassAnalytics(classId);
        setAnalytics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [classId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Class Analytics</h2>
      <p>Average: {analytics.academicPerformance.classAverage}</p>
      <p>Attendance: {analytics.attendance.averageRate}%</p>
    </div>
  );
};
```

### Backend Controller

```javascript
import { teacherDataLayer } from '../services/apiDataLayer';
import { asyncHandler } from '../utils/asyncHandler';

export const getClassAnalytics = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const { term } = req.query;

  const analytics = await teacherDataLayer.getClassAnalytics(classId, term);

  res.json({ success: true, analytics });
});
```

---

## Performance Optimization

### Caching Strategy
- **GET requests**: Cached for 5 minutes
- **POST/PUT/DELETE**: No caching, clears related cache
- **Cache key**: `method:endpoint:params`

### Request Deduplication
- Prevents duplicate concurrent requests
- Returns same promise for identical requests
- Reduces server load

### Retry Logic
- Exponential backoff: 1s, 2s, 4s
- Max 3 retries
- No retry on client errors

### Pagination
- Use `page` and `limit` parameters
- Default: page 1, limit 20
- Returns total count and page info

---

## Error Handling

### Error Types

```javascript
// API Error
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Usage
try {
  await teacherApi.getClassAnalytics('invalid-id');
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`HTTP ${error.status}: ${error.message}`);
  }
}
```

### Common Errors

| Status | Meaning | Action |
|--------|---------|--------|
| 400 | Bad Request | Check parameters |
| 401 | Unauthorized | Re-authenticate |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Verify resource ID |
| 500 | Server Error | Retry or contact support |

---

## Best Practices

### 1. **Use Caching Wisely**
```javascript
// Good - Use cache for read-only data
const analytics = await teacherApi.getClassAnalytics('class-1');

// Bad - Don't cache frequently changing data
const notifications = await teacherApi.getNotifications(1, 20, { useCache: false });
```

### 2. **Handle Errors Properly**
```javascript
try {
  const data = await teacherApi.getClassAnalytics('class-1');
} catch (error) {
  console.error('Failed to load analytics:', error);
  // Show user-friendly error message
}
```

### 3. **Use Request Deduplication**
```javascript
// Automatically deduplicates
Promise.all([
  teacherApi.getDashboard(),
  teacherApi.getDashboard(),
]); // Only 1 API call
```

### 4. **Clear Cache When Needed**
```javascript
import { apiUtils } from './services/apiDataLayer';

// After creating/updating data
await teacherApi.createNote(...);
apiUtils.clearCache('notes'); // Clear notes cache
```

---

## Configuration

### Environment Variables

```env
# Frontend
REACT_APP_API_URL=http://localhost:5000/api

# Backend
API_PORT=5000
CACHE_DURATION=300000 # 5 minutes
MAX_RETRIES=3
RETRY_DELAY=1000
```

---

## Monitoring & Debugging

### Enable Logging

```javascript
// In browser console
localStorage.setItem('DEBUG_API', 'true');

// View cache
const cache = new Map(); // Access from DevTools
```

### Performance Metrics

```javascript
// Measure API call time
console.time('getAnalytics');
await teacherApi.getClassAnalytics('class-1');
console.timeEnd('getAnalytics');
```

---

## Troubleshooting

### Cache Not Working
- Check cache duration (default 5 min)
- Verify cache key format
- Clear cache manually: `apiUtils.clearCache()`

### Requests Timing Out
- Increase timeout: `{ timeout: 60000 }`
- Check network connectivity
- Verify API server is running

### Duplicate Requests
- Check for concurrent identical requests
- Use request deduplication
- Monitor network tab

---

## Summary

The API Data Layer provides:
- ✅ Centralized API communication
- ✅ Automatic caching and retry logic
- ✅ Request deduplication
- ✅ Comprehensive error handling
- ✅ Backend data abstraction
- ✅ Performance optimization
- ✅ Easy to use and maintain

