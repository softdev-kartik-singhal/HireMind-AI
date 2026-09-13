const API_BASE = 'http://localhost:5001/api/v1';

async function testJobMatching() {
  console.log('--- Starting Resume-to-Job Matching E2E Test ---');

  // 1. Login as recruiter
  console.log('1. Logging in as recruiter (sarah.jenkins@hiremind.ai)...');
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'sarah.jenkins@hiremind.ai',
      password: 'Password123',
    }),
  });

  const loginData = await loginRes.json();
  if (!loginRes.ok) {
    throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
  }
  const recruiterToken = loginData.data.accessToken;
  console.log('✓ Recruiter logged in successfully.');

  // 2. Fetch jobs
  console.log('2. Fetching jobs...');
  const jobsRes = await fetch(`${API_BASE}/jobs`, {
    headers: { Authorization: `Bearer ${recruiterToken}` },
  });
  const jobsData = await jobsRes.json();
  const jobs = Array.isArray(jobsData.data) ? jobsData.data : jobsData.data?.jobs || [];
  if (jobs.length === 0) {
    throw new Error(`No jobs found in system: ${JSON.stringify(jobsData)}`);
  }
  const targetJob = jobs[0];
  console.log(`✓ Target Job: "${targetJob.title}" (ID: ${targetJob.id})`);
  console.log(`  Required Skills: ${targetJob.requiredSkills.join(', ')}`);

  // 3. Login as candidate to get candidate ID
  console.log('3. Fetching candidate (alex.rivera@hiremind.ai)...');
  const candLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'alex.rivera@hiremind.ai',
      password: 'Password123',
    }),
  });
  const candLoginData = await candLoginRes.json();
  const candidateId = candLoginData.data.user.id;
  console.log(`✓ Candidate ID: ${candidateId} (${candLoginData.data.user.name})`);

  // 4. Request initial match calculation
  console.log('4. Requesting match evaluation (first run - fresh AI calculation)...');
  const matchRes1 = await fetch(
    `${API_BASE}/jobs/${targetJob.id}/matches/${candidateId}`,
    {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    }
  );
  const matchData1 = await matchRes1.json();
  if (!matchRes1.ok) {
    throw new Error(`Match calculation failed: ${JSON.stringify(matchData1)}`);
  }
  console.log('✓ First Match Evaluation Response:');
  console.log(`  Cached: ${matchData1.data.cached}`);
  console.log(`  Overall Score: ${matchData1.data.match.overallScore}/100`);
  console.log(`  Recommendation: ${matchData1.data.match.recommendation}`);
  console.log(`  Matched Skills (${matchData1.data.match.matchedSkills.length}): ${matchData1.data.match.matchedSkills.join(', ')}`);
  console.log(`  Missing Skills (${matchData1.data.match.missingSkills.length}): ${matchData1.data.match.missingSkills.join(', ')}`);
  console.log(`  Strengths: ${matchData1.data.match.strengths.slice(0, 2).join(' | ')}`);
  console.log(`  Weaknesses: ${matchData1.data.match.weaknesses.slice(0, 2).join(' | ')}`);
  console.log(`  Experience Match: ${JSON.stringify(matchData1.data.match.experienceMatch)}`);

  // 5. Verify caching on second call
  console.log('5. Re-requesting match evaluation (should be CACHED from DB)...');
  const matchRes2 = await fetch(
    `${API_BASE}/jobs/${targetJob.id}/matches/${candidateId}`,
    {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    }
  );
  const matchData2 = await matchRes2.json();
  console.log(`✓ Second call cached status: ${matchData2.data.cached}`);
  if (matchData2.data.cached !== true) {
    throw new Error('Expected cached === true on repeated call!');
  }
  console.log('✓ Database caching verified: Reuses persistent analysis without duplicate AI API calls.');

  // 6. Test forceRefresh
  console.log('6. Requesting with forceRefresh=true...');
  const matchRes3 = await fetch(
    `${API_BASE}/jobs/${targetJob.id}/matches/${candidateId}?forceRefresh=true`,
    {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    }
  );
  const matchData3 = await matchRes3.json();
  console.log(`✓ Force refresh cached status: ${matchData3.data.cached}`);
  if (matchData3.data.cached !== false) {
    throw new Error('Expected cached === false on forceRefresh!');
  }
  console.log('✓ Force refresh verified: Regenerated and saved back to DB.');

  // 7. Test get all matches for job
  console.log(`7. Fetching all evaluated matches for job ${targetJob.id}...`);
  const allMatchesRes = await fetch(
    `${API_BASE}/jobs/${targetJob.id}/matches`,
    {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    }
  );
  const allMatchesData = await allMatchesRes.json();
  console.log(`✓ Total matches stored for job: ${allMatchesData.data.matches.length}`);

  console.log('\n========================================');
  console.log('🎉 ALL BACKEND RESUME-TO-JOB MATCH TESTS PASSED 100%!');
  console.log('========================================');
}

testJobMatching().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
