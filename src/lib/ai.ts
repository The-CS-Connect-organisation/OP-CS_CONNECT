
const CEREBRAS_API_KEY = import.meta.env.VITE_CEREBRAS_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function chatWithCerebras(messages: AIMessage[], systemPrompt?: string): Promise<string> {
  try {
    const allMessages = [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      ...messages,
    ];

    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CEREBRAS_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-4-scout-17b-16e-instruct',
        messages: allMessages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'I apologize, I could not generate a response.';
  } catch (error) {
    console.error('Cerebras API error:', error);
    throw new Error('AI service is temporarily unavailable. Please try again.');
  }
}

export async function chatWithGemini(messages: AIMessage[], systemPrompt?: string): Promise<string> {
  try {
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not generate a response.';
  } catch (error) {
    console.error('Gemini API error:', error);
    return chatWithCerebras(messages, systemPrompt);
  }
}

export async function getAIResponse(messages: AIMessage[], systemPrompt?: string): Promise<string> {
  return chatWithGemini(messages, systemPrompt);
}

export async function generateStudyPlan(subject: string, topics: string[], level: string): Promise<string> {
  const prompt = `You are an AI study planner for students. Create a detailed, personalized study plan.
Subject: ${subject}
Topics: ${topics.join(', ')}
Student Level: ${level}

Provide a structured weekly study plan with:
1. Daily study goals
2. Recommended resources
3. Practice exercises
4. Revision schedule
5. Tips for better understanding

Format it in a clean, readable way with emojis.`;

  return getAIResponse([{ role: 'user', content: prompt }]);
}

export async function gradeEssay(essay: string, rubric: string, subject: string): Promise<string> {
  const prompt = `You are an AI grading assistant for teachers. Grade the following essay.

Subject: ${subject}
Rubric: ${rubric}

Essay:
${essay}

Provide:
1. Overall Grade (A+ to F)
2. Score out of 100
3. Detailed feedback for each rubric criterion
4. Strengths
5. Areas for improvement
6. Specific suggestions

Be constructive, specific, and helpful.`;

  return getAIResponse([{ role: 'user', content: prompt }]);
}

export async function detectAttendanceAnomaly(records: Array<{date: string, present: boolean, student: string}>): Promise<string> {
  const prompt = `You are an AI attendance analyst. Analyze these attendance records for anomalies and patterns.

Records: ${JSON.stringify(records)}

Identify:
1. Students with concerning absence patterns
2. Day-of-week patterns
3. Potential issues (health, engagement, etc.)
4. Recommended interventions
5. Risk scores for each student

Be data-driven and actionable.`;

  return getAIResponse([{ role: 'user', content: prompt }]);
}

export async function generateReportCard(studentData: {
  name: string;
  class: string;
  subjects: Array<{ name: string; marks: number; total: number; grade: string }>;
  attendance: number;
  behavior: string;
}): Promise<string> {
  const prompt = `You are an AI report card generator. Create a comprehensive, encouraging report card.

Student Data: ${JSON.stringify(studentData)}

Generate:
1. Academic summary
2. Subject-wise analysis
3. Strengths and achievements
4. Areas for growth
5. Personalized teacher remarks
6. Goals for next term

Be encouraging but honest. Use professional language with a warm tone.`;

  return getAIResponse([{ role: 'user', content: prompt }]);
}

export async function getSmartNotifications(context: {
  role: string;
  upcomingDeadlines: string[];
  recentActivity: string[];
  performance: string;
}): Promise<string> {
  const prompt = `You are a smart notification system for a school ERP. Based on the user's context, suggest 3-5 important, actionable notifications.

Context: ${JSON.stringify(context)}

Each notification should have:
- Priority (urgent/high/medium/low)
- Title (concise)
- Message (actionable)
- Suggested action

Make notifications timely, relevant, and helpful. Avoid spam.`;

  return getAIResponse([{ role: 'user', content: prompt }]);
}

export async function optimizeRoute(stops: Array<{name: string, lat: number, lng: number}>, schoolLocation: {lat: number, lng: number}): Promise<string> {
  const prompt = `You are a route optimization AI for school buses. Optimize this route.

Stops: ${JSON.stringify(stops)}
School: ${JSON.stringify(schoolLocation)}

Provide:
1. Optimal stop sequence
2. Estimated time between stops
3. Total route time
4. Fuel efficiency tips
5. Alternative routes if traffic is expected

Be practical and safety-focused.`;

  return getAIResponse([{ role: 'user', content: prompt }]);
}

export async function analyzePerformance(data: {
  studentName: string;
  subjects: Array<{ name: string; scores: number[] }>;
  attendance: number;
}): Promise<string> {
  const prompt = `You are an AI academic performance analyst. Analyze this student's performance trends.

Data: ${JSON.stringify(data)}

Provide:
1. Performance trend analysis (improving/declining/stable)
2. Subject-wise insights
3. Correlation between attendance and performance
4. Predicted future performance
5. Personalized recommendations
6. Study strategies

Use data-driven insights. Be specific and actionable.`;

  return getAIResponse([{ role: 'user', content: prompt }]);
}

export async function chatAssistant(message: string, role: string, context?: string): Promise<string> {
  const systemPrompt = `You are Cornerstone AI, an intelligent assistant for a school management ERP system. The user's role is: ${role}.

You help with:
- Academic queries and study help
- System navigation and features
- Data analysis and insights
- Scheduling and planning
- Report generation
- Any school-related questions

Be friendly, helpful, and concise. Use emojis occasionally. If context is provided, use it: ${context || 'No additional context.'}`;

  return getAIResponse([{ role: 'user', content: message }], systemPrompt);
}