import { Link } from 'react-router-dom';

export default function Privacy() {
  const updated = new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
  return (
    <div className="page fade-in" style={{ maxWidth:'800px' }}>
      <h1 style={{ fontFamily:'var(--mono)', fontSize:'1.4rem', fontWeight:700, marginBottom:'0.25rem' }}>Privacy Policy</h1>
      <p style={{ color:'var(--text-2)', fontSize:'0.875rem', marginBottom:'2.5rem' }}>Last updated: {updated} · Questions: <a href="mailto:mechggofficial@gmail.com" style={{ color:'var(--accent)' }}>mechggofficial@gmail.com</a></p>

      {[
        {
          title:'1. What We Collect',
          body:`Account data: email address, display name, and hashed password (we never store your plain-text password).
          
Usage data: your analysis scores (numerical values only), session timestamps, plan tier, and feature usage.

Uploaded files: gameplay clips are uploaded temporarily for statistical processing and are permanently deleted from our servers immediately after analysis completes. We do not retain video content.

Communications: messages sent through our in-app messaging system, forum posts, and community content you create.

Device/technical data: IP address (used for rate limiting and security only), browser type, and general usage patterns via server logs.`
        },
        {
          title:'2. What We Do NOT Collect',
          body:`We do not collect payment card details — all billing is handled by Stripe, which is PCI-DSS compliant.
We do not sell your data to third parties.
We do not use your gameplay clips for AI training or any purpose other than generating your analysis.
We do not share your personal data with advertisers. Ad placements are contextual (page-based), not based on your personal profile.`
        },
        {
          title:'3. How We Use Your Data',
          body:`To provide the service: scores, history, drill plans, and other features require storing your analysis results.
To maintain security: IP addresses and request logs are retained for up to 30 days for abuse prevention.
To respond to inquiries: if you contact us, we retain that correspondence.
To improve the service: aggregate, anonymized usage statistics only.`
        },
        {
          title:'4. Data Retention',
          body:`Account data: retained until you delete your account.
Analysis scores: retained until you delete your account or individual analyses.
Uploaded video clips: deleted immediately after analysis — typically within seconds of upload completion.
Server logs (IP, timestamps): retained for up to 30 days, then purged.
Payment records: retained for 7 years as required by financial record-keeping laws.`
        },
        {
          title:'5. Your Rights',
          body:`Access: you may request a copy of all personal data we hold about you.
Correction: you may update your display name and email via account settings.
Deletion (Right to Erasure): you may delete your account and all associated data at any time via Settings → Delete Account. This permanently removes your data from our systems within 30 days, except where retention is legally required (e.g. payment records).
Portability: you may request an export of your analysis history.
Objection: you may opt out of non-essential communications by contacting mechggofficial@gmail.com.

To exercise any of these rights, email mechggofficial@gmail.com.`
        },
        {
          title:'6. Cookies & Local Storage',
          body:`Mech.gg uses browser localStorage to store your authentication token (a JWT). This is necessary for the app to function and is not used for tracking or advertising.

If third-party advertisements are displayed, those ad networks may set their own cookies subject to their own privacy policies. We will update this policy before enabling any ad network that uses cookies.`
        },
        {
          title:'7. Third-Party Services',
          body:`Stripe: payment processing. Subject to Stripe's Privacy Policy.
Anthropic Claude API: the MechBot AI assistant uses Anthropic's API. Messages sent to MechBot are processed by Anthropic subject to their Privacy Policy. Do not send sensitive personal information to MechBot.
Replit: hosting platform. Subject to Replit's Privacy Policy.`
        },
        {
          title:'8. Children\'s Privacy (COPPA)',
          body:`Mech.gg is not directed at children under 13. We do not knowingly collect personal information from children under 13. Users aged 13–17 may use the service only with verifiable parental consent and active supervision.

If you believe we have inadvertently collected information from a child under 13, contact mechggofficial@gmail.com immediately and we will delete it.`
        },
        {
          title:'9. International Users (GDPR)',
          body:`If you are located in the European Economic Area (EEA), your personal data may be processed in the United States. By using Mech.gg, you consent to this transfer.

Our legal basis for processing is: (a) contract performance — to provide the service you signed up for; (b) legitimate interests — for security and fraud prevention; and (c) consent — for any optional processing.

EEA users have the right to lodge a complaint with their local data protection authority.`
        },
        {
          title:'10. Security',
          body:`We use bcrypt for password hashing, JWT for session tokens, and HTTPS for all data transmission. Our database is not publicly accessible. However, no system is 100% secure. If you discover a security issue, please disclose it responsibly to mechggofficial@gmail.com.`
        },
        {
          title:'11. Changes to This Policy',
          body:`We will update this page when this policy changes and update the "last updated" date. For material changes, we will notify registered users by email where feasible.`
        },
      ].map(s => (
        <section key={s.title} style={{ marginBottom:'2rem' }}>
          <h2 style={{ fontFamily:'var(--mono)', fontSize:'0.95rem', fontWeight:700, color:'var(--accent)', marginBottom:'0.875rem' }}>{s.title}</h2>
          <div className="card" style={{ fontSize:'0.86rem', color:'var(--text-2)', lineHeight:1.8, whiteSpace:'pre-line' }}>{s.body.replace(/^ +/gm,'')}</div>
        </section>
      ))}

      <div style={{ textAlign:'center', marginTop:'2rem', fontSize:'0.78rem', color:'var(--text-3)' }}>
        <Link to="/legal" style={{ color:'var(--accent)' }}>Terms of Use & Refund Policy</Link> · <a href="mailto:mechggofficial@gmail.com" style={{ color:'var(--accent)' }}>mechggofficial@gmail.com</a>
      </div>
    </div>
  );
}
