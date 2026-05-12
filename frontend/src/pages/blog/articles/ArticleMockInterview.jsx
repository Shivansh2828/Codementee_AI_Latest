import React from 'react';
import { Link } from 'react-router-dom';

const P = ({ children, theme }) => <p className={`${theme.text.secondary} leading-relaxed mb-3 text-[15px]`}>{children}</p>;
const H2 = ({ children, theme }) => <h2 className={`text-2xl font-bold ${theme.text.primary} mb-4 mt-10`}>{children}</h2>;
const H3 = ({ children, theme }) => <h3 className={`text-lg font-semibold ${theme.text.primary} mb-2 mt-6`}>{children}</h3>;
const Callout = ({ children, theme }) => (
  <div className={`border-l-4 border-[#06b6d4] pl-4 py-2 my-5 ${theme.bg.card} rounded-r-lg`}>
    <p className={`text-sm ${theme.text.secondary} italic`}>{children}</p>
  </div>
);

const ArticleMockInterview = ({ theme }) => (
  <div>
    <H2 theme={theme}>Why Most Engineers Do Mock Interviews Wrong</H2>
    <P theme={theme}>
      The typical approach: solve a LeetCode problem alone, check the solution, move on. This is passive learning. It builds pattern recognition but not the skill that actually matters in interviews — thinking out loud, handling hints, and communicating your approach clearly under pressure.
    </P>
    <P theme={theme}>
      A mock interview is not just about whether you solve the problem. It's about practicing the entire experience: the nerves, the communication, the time pressure, and the feedback loop.
    </P>
    <Callout theme={theme}>
      Research consistently shows that retrieval practice (being tested) is 2-3x more effective than re-reading or re-watching. Mock interviews are the highest-quality retrieval practice available for technical interviews.
    </Callout>

    <H2 theme={theme}>Before the Mock Interview</H2>
    <H3 theme={theme}>Choose the Right Interviewer</H3>
    <P theme={theme}>
      The quality of your mock interview is almost entirely determined by the quality of your interviewer. Look for:
    </P>
    <ul className="space-y-2 mb-5 ml-4">
      {[
        'Someone who has conducted real interviews at your target company',
        'An engineer at the level you\'re targeting (SDE-2 mock with an SDE-2 or above)',
        'Someone who will give honest, specific feedback — not just encouragement',
        'Ideally, someone who has recently interviewed at the company (interview styles change)',
      ].map((item, i) => (
        <li key={i} className={`flex items-start gap-2 text-[15px] ${theme.text.secondary}`}>
          <span className="text-[#06b6d4] mt-1 shrink-0">→</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>

    <H3 theme={theme}>Set Clear Goals</H3>
    <P theme={theme}>
      Before each mock, decide what you're specifically working on. "Get better at interviews" is too vague. Better goals:
    </P>
    <ul className="space-y-2 mb-5 ml-4">
      {[
        'Practice thinking out loud — narrate every step of your thought process',
        'Work on handling hints gracefully — don\'t freeze when the interviewer nudges you',
        'Practice time management — spend no more than 5 minutes on clarification',
        'Work on edge cases — always ask about null inputs, empty arrays, overflow',
      ].map((item, i) => (
        <li key={i} className={`flex items-start gap-2 text-[15px] ${theme.text.secondary}`}>
          <span className="text-[#06b6d4] mt-1 shrink-0">→</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>

    <H2 theme={theme}>During the Mock Interview</H2>
    <H3 theme={theme}>The First 5 Minutes Are Critical</H3>
    <P theme={theme}>
      Most candidates rush to code. This is a mistake. The first 5 minutes should be spent clarifying the problem. Ask about:
    </P>
    <ul className="space-y-2 mb-5 ml-4">
      {[
        'Input constraints — what are the size limits? Can inputs be negative?',
        'Edge cases — what should happen with empty input? Duplicates?',
        'Expected output format — return value or print? Single answer or all answers?',
        'Performance requirements — is O(n²) acceptable or do we need O(n)?',
      ].map((item, i) => (
        <li key={i} className={`flex items-start gap-2 text-[15px] ${theme.text.secondary}`}>
          <span className="text-[#06b6d4] mt-1 shrink-0">→</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
    <Callout theme={theme}>
      Interviewers often intentionally leave the problem ambiguous to see if you ask the right questions. Clarifying is not a sign of weakness — it's a sign of engineering maturity.
    </Callout>

    <H3 theme={theme}>Think Out Loud</H3>
    <P theme={theme}>
      This is the hardest skill to develop and the most important. Interviewers cannot evaluate your thinking if you're silent. Even if you're stuck, narrate your confusion: "I'm trying to figure out whether a greedy approach works here, but I'm not sure it handles this case..."
    </P>
    <P theme={theme}>
      A candidate who talks through a wrong approach and self-corrects often scores higher than a candidate who silently arrives at the right answer.
    </P>

    <H3 theme={theme}>Handling Hints</H3>
    <P theme={theme}>
      When an interviewer gives a hint, they're not penalizing you — they're trying to help you succeed. The right response:
    </P>
    <ul className="space-y-2 mb-5 ml-4">
      {[
        'Acknowledge the hint: "That\'s a good point, let me think about that..."',
        'Incorporate it visibly: show the interviewer you understood and are applying it',
        'Don\'t pretend you already knew — it looks worse than accepting help gracefully',
        'Ask for clarification if the hint is unclear: "Are you suggesting I should consider...?"',
      ].map((item, i) => (
        <li key={i} className={`flex items-start gap-2 text-[15px] ${theme.text.secondary}`}>
          <span className="text-[#06b6d4] mt-1 shrink-0">→</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>

    <H2 theme={theme}>After the Mock Interview</H2>
    <H3 theme={theme}>How to Use Feedback Effectively</H3>
    <P theme={theme}>
      Feedback is only valuable if you act on it. After each mock:
    </P>
    <ul className="space-y-2 mb-5 ml-4">
      {[
        'Write down the 2-3 most important pieces of feedback immediately',
        'Identify the root cause — was it a knowledge gap, communication issue, or time management?',
        'Practice specifically on the weakness before your next mock',
        'Don\'t schedule your next mock until you\'ve addressed the previous feedback',
      ].map((item, i) => (
        <li key={i} className={`flex items-start gap-2 text-[15px] ${theme.text.secondary}`}>
          <span className="text-[#06b6d4] mt-1 shrink-0">→</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>

    <H2 theme={theme}>How Many Mock Interviews Do You Need?</H2>
    <P theme={theme}>
      There's no universal answer, but here's a practical framework:
    </P>
    <ul className="space-y-2 mb-5 ml-4">
      {[
        'Minimum: 5 mocks before your first real interview',
        'Recommended: 10-15 mocks spread over 4-6 weeks',
        'For senior roles (SDE-2+): include at least 3-4 system design mocks',
        'Stop when you\'re consistently getting positive feedback and feel comfortable',
      ].map((item, i) => (
        <li key={i} className={`flex items-start gap-2 text-[15px] ${theme.text.secondary}`}>
          <span className="text-[#06b6d4] mt-1 shrink-0">→</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>

    <div className={`p-5 rounded-xl border border-[#06b6d4]/30 bg-[#06b6d4]/5 mt-6`}>
      <p className={`text-sm font-semibold text-[#06b6d4] mb-1`}>Book a Mock Interview with a MAANG Engineer</p>
      <p className={`text-sm ${theme.text.secondary} mb-3`}>
        Codementee connects you with engineers from Google, Amazon, and Meta who conduct real interviews. Get detailed written feedback after every session.
      </p>
      <Link to="/mock-interviews" className="text-sm font-semibold text-[#06b6d4] hover:underline">
        View plans and pricing →
      </Link>
    </div>
  </div>
);

export default ArticleMockInterview;
