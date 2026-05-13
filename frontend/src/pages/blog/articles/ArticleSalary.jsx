import React from 'react';

const P = ({ children, theme }) => <p className={`${theme.text.secondary} leading-relaxed mb-3 text-[15px]`}>{children}</p>;
const H2 = ({ children, theme }) => <h2 className={`text-2xl font-bold ${theme.text.primary} mb-4 mt-10`}>{children}</h2>;
const H3 = ({ children, theme }) => <h3 className={`text-lg font-semibold ${theme.text.primary} mb-2 mt-6`}>{children}</h3>;
const Callout = ({ children, theme }) => (
  <div className={`border-l-4 border-green-400 pl-4 py-2 my-5 ${theme.bg.card} rounded-r-lg`}>
    <p className={`text-sm ${theme.text.secondary} italic`}>{children}</p>
  </div>
);

const SalaryRow = ({ company, level, base, bonus, rsu, total, theme }) => (
  <tr className={`border-b ${theme.border.primary}`}>
    <td className={`py-3 px-4 text-sm font-medium ${theme.text.primary}`}>{company}</td>
    <td className={`py-3 px-4 text-sm ${theme.text.secondary}`}>{level}</td>
    <td className={`py-3 px-4 text-sm ${theme.text.secondary}`}>{base}</td>
    <td className={`py-3 px-4 text-sm ${theme.text.secondary}`}>{bonus}</td>
    <td className={`py-3 px-4 text-sm ${theme.text.secondary}`}>{rsu}</td>
    <td className={`py-3 px-4 text-sm font-semibold text-[#06b6d4]`}>{total}</td>
  </tr>
);

const ArticleSalary = ({ theme }) => (
  <div>
    <H2 theme={theme}>How Tech Compensation Works in India</H2>
    <P theme={theme}>
      Software engineer compensation at top tech companies in India has three components: base salary (fixed monthly), annual bonus (performance-based, typically 10-20% of base), and RSUs (Restricted Stock Units — company stock that vests over 4 years).
    </P>
    <P theme={theme}>
      The total compensation (TC) is what matters, not just the base salary. A company offering ₹30 LPA base with significant RSUs can easily have a TC of ₹60-80 LPA.
    </P>
    <Callout theme={theme}>
      All figures below are approximate ranges based on publicly available data from Glassdoor, Levels.fyi, and community reports. Actual compensation varies significantly based on negotiation, performance, and team.
    </Callout>

    <H2 theme={theme}>SDE-1 (0-3 Years Experience)</H2>
    <div className={`overflow-x-auto rounded-xl border ${theme.border.primary} mb-6`}>
      <table className="w-full">
        <thead>
          <tr className={`${theme.bg.secondary} border-b ${theme.border.primary}`}>
            {['Company', 'Level', 'Base (LPA)', 'Bonus', 'RSU/yr', 'Total TC'].map(h => (
              <th key={h} className={`py-3 px-4 text-left text-xs font-semibold ${theme.text.muted} uppercase`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <SalaryRow theme={theme} company="Google" level="L3" base="₹25-35L" bonus="15%" rsu="₹15-25L" total="₹45-65L" />
          <SalaryRow theme={theme} company="Amazon" level="SDE-1" base="₹22-30L" bonus="Sign-on" rsu="₹10-20L" total="₹35-55L" />
          <SalaryRow theme={theme} company="Microsoft" level="SDE-1" base="₹20-28L" bonus="15%" rsu="₹8-15L" total="₹32-48L" />
          <SalaryRow theme={theme} company="Meta" level="E3" base="₹28-38L" bonus="15%" rsu="₹20-30L" total="₹52-75L" />
          <SalaryRow theme={theme} company="Flipkart" level="SDE-1" base="₹18-25L" bonus="10-15%" rsu="₹5-10L" total="₹25-38L" />
          <SalaryRow theme={theme} company="Swiggy/Zomato" level="SDE-1" base="₹15-22L" bonus="10%" rsu="₹5-8L" total="₹22-32L" />
        </tbody>
      </table>
    </div>

    <H2 theme={theme}>SDE-2 (3-7 Years Experience)</H2>
    <div className={`overflow-x-auto rounded-xl border ${theme.border.primary} mb-6`}>
      <table className="w-full">
        <thead>
          <tr className={`${theme.bg.secondary} border-b ${theme.border.primary}`}>
            {['Company', 'Level', 'Base (LPA)', 'Bonus', 'RSU/yr', 'Total TC'].map(h => (
              <th key={h} className={`py-3 px-4 text-left text-xs font-semibold ${theme.text.muted} uppercase`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <SalaryRow theme={theme} company="Google" level="L4" base="₹35-50L" bonus="15%" rsu="₹25-45L" total="₹65-105L" />
          <SalaryRow theme={theme} company="Amazon" level="SDE-2" base="₹30-42L" bonus="15%" rsu="₹20-35L" total="₹55-85L" />
          <SalaryRow theme={theme} company="Microsoft" level="SDE-2" base="₹28-40L" bonus="15%" rsu="₹15-30L" total="₹48-80L" />
          <SalaryRow theme={theme} company="Meta" level="E4" base="₹40-55L" bonus="15%" rsu="₹35-55L" total="₹80-120L" />
          <SalaryRow theme={theme} company="Flipkart" level="SDE-2" base="₹25-38L" bonus="15%" rsu="₹10-20L" total="₹38-62L" />
          <SalaryRow theme={theme} company="Swiggy/Zomato" level="SDE-2" base="₹22-32L" bonus="12%" rsu="₹8-15L" total="₹32-50L" />
        </tbody>
      </table>
    </div>

    <H2 theme={theme}>Senior SDE / Staff (7+ Years)</H2>
    <div className={`overflow-x-auto rounded-xl border ${theme.border.primary} mb-6`}>
      <table className="w-full">
        <thead>
          <tr className={`${theme.bg.secondary} border-b ${theme.border.primary}`}>
            {['Company', 'Level', 'Base (LPA)', 'Bonus', 'RSU/yr', 'Total TC'].map(h => (
              <th key={h} className={`py-3 px-4 text-left text-xs font-semibold ${theme.text.muted} uppercase`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <SalaryRow theme={theme} company="Google" level="L5/L6" base="₹55-90L" bonus="20%" rsu="₹50-100L" total="₹1.2-2.2Cr" />
          <SalaryRow theme={theme} company="Amazon" level="SDE-3" base="₹45-70L" bonus="20%" rsu="₹40-80L" total="₹95L-1.8Cr" />
          <SalaryRow theme={theme} company="Microsoft" level="Senior" base="₹45-65L" bonus="20%" rsu="₹35-70L" total="₹90L-1.6Cr" />
          <SalaryRow theme={theme} company="Meta" level="E5/E6" base="₹65-100L" bonus="20%" rsu="₹80-150L" total="₹1.6-2.8Cr" />
        </tbody>
      </table>
    </div>

    <H2 theme={theme}>How to Negotiate Your Offer</H2>
    <H3 theme={theme}>Always Negotiate</H3>
    <P theme={theme}>
      The first offer is almost never the best offer. Companies expect negotiation. Declining to negotiate leaves money on the table — often ₹3-10 LPA or more in RSUs.
    </P>
    <ul className="space-y-2 mb-5 ml-4">
      {[
        'Never give a number first — let the company make the first offer',
        'Get the offer in writing before negotiating — verbal offers are not binding',
        'Negotiate total compensation, not just base — RSUs and signing bonus are often more flexible',
        'Use competing offers as leverage — even if you prefer this company, a competing offer gives you negotiating power',
        'Be specific: "Based on my research and the competing offer I have, I was expecting ₹X. Is there flexibility?"',
      ].map((item, i) => (
        <li key={i} className={`flex items-start gap-2 text-[15px] ${theme.text.secondary}`}>
          <span className="text-green-400 mt-1 shrink-0">→</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>

    <H3 theme={theme}>What's Negotiable</H3>
    <ul className="space-y-2 mb-5 ml-4">
      {[
        'Base salary — usually 10-20% flexibility',
        'Signing bonus — often the most flexible component',
        'RSU grant — can sometimes be increased by 20-30%',
        'Start date — usually flexible by 2-4 weeks',
        'Level — if you have strong competing offers, you can sometimes negotiate a higher level',
      ].map((item, i) => (
        <li key={i} className={`flex items-start gap-2 text-[15px] ${theme.text.secondary}`}>
          <span className="text-green-400 mt-1 shrink-0">→</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>

    <Callout theme={theme}>
      The best way to get a higher offer is to have a competing offer. Even if you don't plan to take it, going through the interview process at multiple companies simultaneously gives you real leverage.
    </Callout>

    <H2 theme={theme}>The Real Cost of Not Preparing</H2>
    <P theme={theme}>
      The difference between an SDE-1 offer and an SDE-2 offer at Google India is roughly ₹20-40 LPA in total compensation. Over 4 years, that's ₹80L-1.6Cr. The difference between a mediocre offer and a negotiated offer at the same level is often ₹5-15 LPA.
    </P>
    <P theme={theme}>
      Investing 3-6 months in serious preparation — including mock interviews with real engineers — is one of the highest-ROI activities available to a software engineer.
    </P>
  </div>
);

export default ArticleSalary;
