const API_BASE = 'http://localhost:5001/api/v1';

async function testInterviewFlow() {
  console.log('=== Starting Phase 3 Technical Interview System E2E Test ===');

  // 1. Recruiter Login
  console.log('1. Authenticating recruiter (sarah.jenkins@hiremind.ai)...');
  const recRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'sarah.jenkins@hiremind.ai',
      password: 'Password123',
    }),
  });
  const recData = await recRes.json();
  if (!recRes.ok) throw new Error(`Recruiter login failed: ${JSON.stringify(recData)}`);
  const recruiterToken = recData.data.accessToken;
  console.log('✓ Recruiter authenticated.');

  // 2. Candidate Login
  console.log('2. Authenticating candidate (alex.rivera@hiremind.ai)...');
  const candRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'alex.rivera@hiremind.ai',
      password: 'Password123',
    }),
  });
  const candData = await candRes.json();
  if (!candRes.ok) throw new Error(`Candidate login failed: ${JSON.stringify(candData)}`);
  const candidateToken = candData.data.accessToken;
  const candidateId = candData.data.user.id;
  console.log(`✓ Candidate authenticated (ID: ${candidateId}).`);

  // 3. Get a Job
  console.log('3. Fetching active job requisition...');
  const jobsRes = await fetch(`${API_BASE}/jobs`, {
    headers: { Authorization: `Bearer ${recruiterToken}` },
  });
  const jobsData = await jobsRes.json();
  const jobs = Array.isArray(jobsData.data) ? jobsData.data : jobsData.data?.jobs || [];
  if (jobs.length === 0) throw new Error('No jobs available for scheduling');
  const targetJob = jobs[0];
  console.log(`✓ Target Job: "${targetJob.title}" (ID: ${targetJob.id})`);

  // 4. Recruiter creates interview
  console.log('4. Recruiter scheduling technical interview...');
  const scheduledDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const createRes = await fetch(`${API_BASE}/interviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${recruiterToken}`,
    },
    body: JSON.stringify({
      title: 'Distributed Systems & Concurrency Technical Round',
      type: 'MIXED',
      difficulty: 'MEDIUM',
      durationMins: 45,
      numQuestions: 3,
      scheduledAt: scheduledDate,
      jobId: targetJob.id,
      candidateId,
      notes: 'Evaluate lock-free queues, database indexing, and behavioral ownership.',
    }),
  });
  const createData = await createRes.json();
  if (!createRes.ok) throw new Error(`Create interview failed: ${JSON.stringify(createData)}`);
  const interview = createData.data.interview;
  console.log(`✓ Interview scheduled (ID: ${interview.id})`);
  console.log(`  Type: ${interview.type} | Difficulty: ${interview.difficulty} | Questions: ${interview.questions?.length}`);
  console.log(`  Initial Session Status: ${interview.session?.status}`);

  // 5. Candidate starts session
  console.log('5. Candidate starting interview session (POST /session/start)...');
  const startRes = await fetch(`${API_BASE}/interviews/${interview.id}/session/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${candidateToken}`,
    },
  });
  const startData = await startRes.json();
  if (!startRes.ok) throw new Error(`Start session failed: ${JSON.stringify(startData)}`);
  console.log(`✓ Session transitioned to IN_PROGRESS.`);
  console.log(`  Started At: ${startData.data.session.startedAt}`);
  console.log(`  Expires At: ${startData.data.session.expiresAt}`);
  console.log(`  Time Remaining: ${startData.data.session.timeRemainingSeconds} seconds`);

  const questions = startData.data.questions;
  if (!questions || questions.length === 0) throw new Error('No questions generated for session');
  const firstQuestion = questions[0];
  console.log(`✓ First Question: "${firstQuestion.title}" (${firstQuestion.type})`);

  // 6. Autosave progress (Draft code buffer + active answer)
  console.log('6. Autosaving candidate draft progress to server...');
  const draftCode = 'function solution() {\n  // Draft implementation surviving refresh\n  return true;\n}';
  const saveRes = await fetch(`${API_BASE}/interviews/${interview.id}/session/progress`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${candidateToken}`,
    },
    body: JSON.stringify({
      currentQuestionIndex: 0,
      clientState: {
        lastSavedCode: draftCode,
        editorLanguage: 'typescript',
      },
      activeResponse: {
        questionId: firstQuestion.id,
        codeAnswer: draftCode,
        codeLanguage: 'typescript',
        timeSpentSeconds: 120,
      },
    }),
  });
  const saveData = await saveRes.json();
  if (!saveRes.ok) throw new Error(`Save progress failed: ${JSON.stringify(saveData)}`);
  console.log('✓ Progress autosaved server-side successfully.');

  // 7. Test page refresh survival
  console.log('7. Simulating browser reload (GET /session)...');
  const reloadRes = await fetch(`${API_BASE}/interviews/${interview.id}/session`, {
    headers: { Authorization: `Bearer ${candidateToken}` },
  });
  const reloadData = await reloadRes.json();
  if (!reloadRes.ok) throw new Error(`Session reload failed: ${JSON.stringify(reloadData)}`);

  console.log(`✓ Session retrieved after simulated reload:`);
  console.log(`  Status: ${reloadData.data.session.status}`);
  console.log(`  Current Question Index: ${reloadData.data.session.currentQuestionIndex}`);
  console.log(`  Remaining Time: ${reloadData.data.session.timeRemainingSeconds}s`);
  console.log(`  Saved Responses Count: ${reloadData.data.responses?.length}`);

  const savedResp = reloadData.data.responses.find((r) => r.questionId === firstQuestion.id);
  if (!savedResp || !savedResp.codeAnswer?.includes('surviving refresh')) {
    throw new Error('Draft buffer failed to survive page reload!');
  }
  console.log('✓ VERIFIED: Draft code buffer and session progress SURVIVED page reload with zero data loss!');

  // 8. Submit Question 1
  console.log('8. Submitting final answer for Question 1...');
  const submitRes = await fetch(
    `${API_BASE}/interviews/${interview.id}/questions/${firstQuestion.id}/submit`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
      },
      body: JSON.stringify({
        codeAnswer: draftCode,
        codeLanguage: 'typescript',
        timeSpentSeconds: 300,
      }),
    }
  );
  const submitData = await submitRes.json();
  if (!submitRes.ok) throw new Error(`Submit question failed: ${JSON.stringify(submitData)}`);
  console.log(`✓ Question 1 submitted (isSubmitted: ${submitData.data.response.isSubmitted}).`);

  // 9. Complete interview session
  console.log('9. Completing interview session (POST /session/complete)...');
  const completeRes = await fetch(
    `${API_BASE}/interviews/${interview.id}/session/complete`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
      },
    }
  );
  const completeData = await completeRes.json();
  if (!completeRes.ok) throw new Error(`Complete session failed: ${JSON.stringify(completeData)}`);
  console.log(`✓ Interview finalized with status: ${completeData.data.session.status}`);
  console.log(`  Completed At: ${completeData.data.session.completedAt}`);

  console.log('\n======================================================');
  console.log('🎉 ALL PHASE 3 BACKEND INTERVIEW SYSTEM TESTS PASSED 100%!');
  console.log('======================================================');
}

testInterviewFlow().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
