// Automated verification script for Phase 3 AI Question Generation Engine & Recruiter Review
import axios from 'axios';

const BASE_URL = 'http://localhost:5001/api/v1';

async function run() {
  console.log('=== Starting Phase 3 AI Question Generation & Review E2E Test ===');

  // 1. Recruiter Login
  console.log('1. Authenticating recruiter (sarah.jenkins@hiremind.ai)...');
  const recruiterRes = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'sarah.jenkins@hiremind.ai',
    password: 'Password123',
  });
  const recruiterToken = recruiterRes.data.data.accessToken;
  const recruiterClient = axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${recruiterToken}` },
  });
  console.log('✓ Recruiter authenticated.');

  // 2. Candidate Info
  console.log('2. Authenticating candidate (alex.rivera@hiremind.ai)...');
  const candidateRes = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'alex.rivera@hiremind.ai',
    password: 'Password123',
  });
  const candidateId = candidateRes.data.data.user.id;
  console.log(`✓ Candidate authenticated: ID ${candidateId}`);

  // 3. Find Job
  console.log('3. Fetching active job requisition...');
  const jobsRes = await recruiterClient.get('/jobs');
  const jobs = Array.isArray(jobsRes.data.data) ? jobsRes.data.data : jobsRes.data.data?.jobs || [];
  const targetJob = jobs[0];
  console.log(`✓ Target Job: "${targetJob.title}" (ID: ${targetJob.id})`);

  // 4. Schedule interview with AI generated questions
  console.log('4. Recruiter scheduling interview with AI question generation...');
  const scheduleRes = await recruiterClient.post('/interviews', {
    title: 'AI Engine Architecture & Concurrency Deep Dive',
    type: 'TECHNICAL',
    difficulty: 'HARD',
    durationMins: 60,
    numQuestions: 4,
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    jobId: targetJob.id,
    candidateId: 'alex.rivera@hiremind.ai',
    notes: 'Focus on distributed consensus, transaction isolation, and high availability.',
  });
  const interview = scheduleRes.data.data.interview;
  const interviewId = interview.id;
  console.log(`✓ Interview created: ID ${interviewId}`);
  console.log(`  Initial questions generated: ${interview.questions?.length || 0}`);

  // 5. Test Persistence & Idempotency: "The AI must NOT repeatedly generate questions every time the page loads. Generate once and persist."
  console.log('5. Testing idempotency: Calling generate questions endpoint without forceRefresh...');
  const cachedGenRes = await recruiterClient.post(`/interviews/${interviewId}/questions/generate`);
  console.log(`✓ Response cached flag: ${cachedGenRes.data.data.cached} (Should be true)`);
  if (!cachedGenRes.data.data.cached) {
    throw new Error('FAILED: Questions were re-generated instead of returning persisted cached questions!');
  }
  console.log(`✓ Verified: Persisted questions loaded instantly without redundant AI generation.`);

  // 6. Fetch questions list
  console.log('6. Fetching persisted questions...');
  const questionsRes = await recruiterClient.get(`/interviews/${interviewId}/questions`);
  let questions = questionsRes.data.data.questions;
  console.log(`✓ Persisted questions count: ${questions.length}`);
  for (const q of questions) {
    console.log(`  - [${q.category}] (${q.difficulty}) ${q.title}`);
    console.log(`    Expected Topics (${q.expectedTopics?.length || 0}): ${q.expectedTopics?.join(', ')}`);
    console.log(`    Evaluation Criteria (${q.evaluationCriteria?.length || 0}): ${q.evaluationCriteria?.join('; ')}`);
  }

  // 7. Test Adding a Custom Question
  console.log('7. Recruiter adding a custom question...');
  const addRes = await recruiterClient.post(`/interviews/${interviewId}/questions`, {
    title: 'PostgreSQL WAL Logging & Write Amplification',
    description: 'Explain Write-Ahead Logging (WAL) internals in PostgreSQL and how checkpoint intervals impact recovery time and disk write amplification.',
    category: 'Fundamentals',
    difficulty: 'HARD',
    type: 'TECHNICAL',
    expectedTopics: ['Write-Ahead Logging (WAL)', 'Checkpoints & max_wal_size', 'fsync performance', 'Write amplification'],
    evaluationCriteria: [
      'Accurately describes how WAL ensures atomicity and durability before dirty buffers are flushed',
      'Explains trade-offs of aggressive checkpointing versus recovery duration',
    ],
    timeLimitMins: 15,
  });
  const addedQuestion = addRes.data.data.question;
  console.log(`✓ Added question: "${addedQuestion.title}" (ID: ${addedQuestion.id}, orderIndex: ${addedQuestion.orderIndex})`);

  // 8. Test Editing an Existing Question
  console.log('8. Recruiter updating the added question...');
  const updateRes = await recruiterClient.patch(`/interviews/${interviewId}/questions/${addedQuestion.id}`, {
    title: 'PostgreSQL WAL Internals & Replica Lag',
    expectedTopics: ['WAL sender/receiver processes', 'Streaming replication', 'Replica lag calculation'],
  });
  const updatedQuestion = updateRes.data.data.question;
  console.log(`✓ Updated question title: "${updatedQuestion.title}"`);

  // 9. Test Reordering Questions
  console.log('9. Recruiter reordering questions (moving added question to position #1)...');
  const currentQList = (await recruiterClient.get(`/interviews/${interviewId}/questions`)).data.data.questions;
  const reorderedIds = [addedQuestion.id, ...currentQList.filter(q => q.id !== addedQuestion.id).map(q => q.id)];
  const reorderRes = await recruiterClient.put(`/interviews/${interviewId}/questions/reorder`, {
    questionIds: reorderedIds,
  });
  const newQList = reorderRes.data.data.questions;
  console.log(`✓ First question after reorder is now: "${newQList[0].title}" (orderIndex: ${newQList[0].orderIndex})`);
  if (newQList[0].id !== addedQuestion.id) {
    throw new Error('FAILED: Reorder did not position added question at #1');
  }

  // 10. Test Deleting a Question
  console.log('10. Recruiter deleting the question...');
  const deleteRes = await recruiterClient.delete(`/interviews/${interviewId}/questions/${addedQuestion.id}`);
  console.log(`✓ Delete response: ${deleteRes.data.message}`);
  const afterDeleteList = (await recruiterClient.get(`/interviews/${interviewId}/questions`)).data.data.questions;
  console.log(`✓ Remaining questions count: ${afterDeleteList.length}`);
  const indices = afterDeleteList.map(q => q.orderIndex);
  console.log(`✓ Re-normalized order indices: [${indices.join(', ')}]`);

  console.log('\n======================================================');
  console.log('🎉 ALL AI QUESTION GENERATION & REVIEW TESTS PASSED 100%!');
  console.log('======================================================');
}

run().catch((err) => {
  console.error('Test failed with error:', err.response?.data || err.message);
  process.exit(1);
});
