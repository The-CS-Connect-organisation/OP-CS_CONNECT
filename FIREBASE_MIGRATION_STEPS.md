# Step-by-Step Firebase Migration Guide

## PHASE 1: SETUP & CONFIGURATION

### Step 1: Install Dependencies
```bash
cd OP-CS_CONNECT/academics
npm install firebase

cd ../../OP-CS_CONNECT_-Backend-
npm install openai @anthropic-ai/sdk
```

### Step 2: Configure Environment Variables

**Frontend (.env):**
```env
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

**Backend (.env):**
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your_openai_key
ANTHROPIC_API_KEY=sk-ant-your_anthropic_key
```

---

## PHASE 2: FRONTEND MIGRATION

### Step 3: Update useStore Hook

**File:** `OP-CS_CONNECT/academics/src/hooks/useStore.js`

Replace localStorage with Firebase:

```javascript
import { useState, useEffect } from 'react';
import { firebaseAssignmentsService, firebaseSubmissionsService } from '../services/firebaseService';

export const useStore = (key, initialValue = []) => {
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Determine which Firebase service to use based on key
    let unsubscribe;

    if (key === 'ASSIGNMENTS') {
      unsubscribe = firebaseAssignmentsService.subscribe(setData);
    } else if (key === 'SUBMISSIONS') {
      unsubscribe = firebaseSubmissionsService.subscribe(setData);
    }
    // Add more mappings as needed

    setLoading(false);
    return () => unsubscribe?.();
  }, [key]);

  const add = async (item) => {
    // Use appropriate Firebase service
    if (key === 'ASSIGNMENTS') {
      return await firebaseAssignmentsService.create(item);
    }
  };

  const update = async (id, updates) => {
    if (key === 'ASSIGNMENTS') {
      return await firebaseAssignmentsService.update(id, updates);
    }
  };

  const remove = async (id) => {
    if (key === 'ASSIGNMENTS') {
      return await firebaseAssignmentsService.delete(id);
    }
  };

  return { data, loading, add, update, remove };
};
```

### Step 4: Remove seedData.js

**File:** `OP-CS_CONNECT/academics/src/data/seedData.js`

Delete this file entirely. Update `useAuth.js`:

```javascript
// Remove this line:
// import { initializeApp } from '../data/seedData';

// In useEffect, remove:
// initializeApp();
```

### Step 5: Update authService.js

**File:** `OP-CS_CONNECT/academics/src/services/authService.js`

Replace with Firebase Authentication:

```javascript
import { firebaseUsersService } from './firebaseService';

export const authService = {
  async login(email, password) {
    try {
      const user = await firebaseUsersService.getByEmail(email);
      if (!user || user.password !== password) {
        return { success: false, error: 'Invalid credentials' };
      }
      // Store auth token
      localStorage.setItem('authToken', user.id);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async signup(data) {
    try {
      const newUser = await firebaseUsersService.upsert(Date.now().toString(), {
        ...data,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('authToken', newUser.id);
      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  },
};
```

### Step 6: Update assignmentsService.js

**File:** `OP-CS_CONNECT/academics/src/services/assignmentsService.js`

```javascript
import { firebaseAssignmentsService } from './firebaseService';

export const assignmentsService = {
  async getAll() {
    return await firebaseAssignmentsService.getAll();
  },

  async getByClass(classId) {
    return await firebaseAssignmentsService.getByClass(classId);
  },

  async create(assignment) {
    return await firebaseAssignmentsService.create(assignment);
  },

  async update(id, updates) {
    return await firebaseAssignmentsService.update(id, updates);
  },

  async delete(id) {
    return await firebaseAssignmentsService.delete(id);
  },

  subscribe(callback) {
    return firebaseAssignmentsService.subscribe(callback);
  },
};
```

### Step 7: Update Other Services

Repeat Step 6 for:
- `examsService.js`
- `busService.js`
- `notificationsService.js`

---

## PHASE 3: BACKEND CONFIGURATION

### Step 8: Add AI Service to Environment

**File:** `OP-CS_CONNECT_-Backend-/config/env.js`

Add:
```javascript
export const env = {
  // ... existing config
  AI_PROVIDER: process.env.AI_PROVIDER || 'openai',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
};
```

### Step 9: Test Firebase Connection

Create a test file:

**File:** `OP-CS_CONNECT/academics/src/services/__tests__/firebaseService.test.js`

```javascript
import { firebaseUsersService } from '../firebaseService';

describe('Firebase Service', () => {
  test('should fetch users from Firebase', async () => {
    const users = await firebaseUsersService.getAll();
    expect(Array.isArray(users)).toBe(true);
  });

  test('should get user by email', async () => {
    const user = await firebaseUsersService.getByEmail('test@example.com');
    expect(user).toBeDefined();
  });
});
```

Run tests:
```bash
npm test
```

### Step 10: Test AI Endpoints

Create a test file:

**File:** `OP-CS_CONNECT_-Backend-/routes/__tests__/aiEndpoints.test.js`

```javascript
import request from 'supertest';
import app from '../../app.js';

describe('AI Endpoints', () => {
  test('GET /api/teacher/ai/attendance-analysis/:studentId', async () => {
    const response = await request(app)
      .get('/api/teacher/ai/attendance-analysis/student-1')
      .query({ classId: 'class-1' })
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('GET /api/teacher/ai/learning-gaps/:studentId', async () => {
    const response = await request(app)
      .get('/api/teacher/ai/learning-gaps/student-1')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

---

## PHASE 4: VERIFICATION & TESTING

### Step 11: Verify Data Flow

1. **Check Firebase Connection:**
   - Open browser DevTools
   - Check Network tab for Firebase requests
   - Verify real-time updates work

2. **Check AI Endpoints:**
   - Use Postman or curl to test endpoints
   - Verify AI responses are cached
   - Check error handling

3. **Check Performance:**
   - Compare load times before/after
   - Monitor Firebase usage
   - Check AI API costs

### Step 12: Update Components

Update all components to use Firebase data:

**Example - StudentDashboard.jsx:**

```javascript
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';

export const StudentDashboard = ({ user }) => {
  const { data: assignments, loading } = useStore(KEYS.ASSIGNMENTS);
  const { data: submissions } = useStore(KEYS.SUBMISSIONS);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {assignments.map(assignment => (
        <div key={assignment.id}>{assignment.title}</div>
      ))}
    </div>
  );
};
```

---

## PHASE 5: CLEANUP & OPTIMIZATION

### Step 13: Remove Mock Data References

Search for and remove:
- `localStorage.getItem(KEYS.*)`
- `setToStorage(KEYS.*)`
- `getFromStorage(KEYS.*)`
- All references to `seedData`

### Step 14: Optimize Firebase Queries

Add indexes for frequently queried fields:

**Firebase Console:**
1. Go to Realtime Database
2. Click "Indexes" tab
3. Add indexes for:
   - `assignments.classId`
   - `assignments.teacherId`
   - `submissions.assignmentId`
   - `submissions.studentId`
   - `attendance_records.studentId`
   - `attendance_records.classId`
   - `marks.studentId`
   - `marks.classId`

### Step 15: Add Error Handling

Wrap Firebase calls with try-catch:

```javascript
try {
  const data = await firebaseService.getAll();
  setData(data);
} catch (error) {
  console.error('Firebase error:', error);
  setError('Failed to load data');
}
```

---

## PHASE 6: DEPLOYMENT

### Step 16: Build & Test

```bash
# Frontend
cd OP-CS_CONNECT/academics
npm run build

# Backend
cd ../../OP-CS_CONNECT_-Backend-
npm run build
```

### Step 17: Deploy

```bash
# Deploy to your hosting platform
# (Vercel, Firebase Hosting, AWS, etc.)
```

### Step 18: Monitor

- Check Firebase console for usage
- Monitor AI API costs
- Track error rates
- Verify real-time updates

---

## ROLLBACK PLAN

If issues occur:

1. **Revert to Mock Data:**
   - Restore `seedData.js`
   - Revert service files
   - Clear Firebase cache

2. **Disable AI Features:**
   - Set `AI_PROVIDER=disabled`
   - Remove AI endpoints
   - Use fallback data

3. **Check Logs:**
   - Firebase console logs
   - Backend error logs
   - Browser console errors

---

## TROUBLESHOOTING

### Issue: Firebase Connection Failed
**Solution:**
- Verify Firebase config in `.env`
- Check Firebase project is active
- Verify network connectivity
- Check Firebase security rules

### Issue: AI API Errors
**Solution:**
- Verify API keys are correct
- Check API rate limits
- Ensure sufficient API credits
- Check API status page

### Issue: Real-time Updates Not Working
**Solution:**
- Check Firebase security rules
- Verify user authentication
- Check browser console for errors
- Verify Firebase listeners are attached

### Issue: Performance Degradation
**Solution:**
- Add Firebase indexes
- Implement pagination
- Cache AI responses
- Optimize queries

---

## COMPLETION CHECKLIST

- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Firebase service layer created
- [ ] AI service layer created
- [ ] useStore hook updated
- [ ] seedData.js removed
- [ ] authService.js updated
- [ ] All services migrated to Firebase
- [ ] Components updated to use Firebase
- [ ] AI endpoints tested
- [ ] Performance verified
- [ ] Error handling implemented
- [ ] Deployed to production
- [ ] Monitoring enabled

---

## ESTIMATED TIMELINE

- **Setup & Configuration:** 1-2 hours
- **Frontend Migration:** 3-4 hours
- **Backend Configuration:** 1-2 hours
- **Testing & Verification:** 2-3 hours
- **Optimization & Cleanup:** 1-2 hours
- **Deployment:** 1 hour

**Total:** 9-14 hours

