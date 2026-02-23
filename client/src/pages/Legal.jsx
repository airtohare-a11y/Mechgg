import { DisclaimerBanner } from '../components/Legal';

export default function LegalPage() {
  return (
    <div className="page fade-in" style={{ maxWidth:'800px' }}>
      <h1 style={{ fontFamily:'var(--mono)', fontSize:'1.4rem', fontWeight:700, marginBottom:'0.35rem' }}>Legal & Policies</h1>
      <p style={{ color:'var(--text-2)', fontSize:'0.875rem', marginBottom:'2rem' }}>Last updated: {new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</p>

      {/* Age & Use Policy */}
      <section style={{ marginBottom:'2rem' }}>
        <h2 style={{ fontFamily:'var(--mono)', fontSize:'1rem', fontWeight:700, color:'var(--accent)', marginBottom:'1rem' }}>Age Requirements & Intended Use</h2>
        <div className="card" style={{ lineHeight:1.8, fontSize:'0.875rem', color:'var(--text-2)' }}>
          <p style={{ marginBottom:'0.75rem' }}>Mech.gg is intended for use by <strong style={{ color:'var(--text)' }}>adults aged 18 and over</strong>. Users between the ages of 13 and 17 may use this service only with the <strong style={{ color:'var(--text)' }}>active supervision and consent of a parent or legal guardian</strong>. Users under the age of 13 are not permitted to use this service under any circumstances.</p>
          <p style={{ marginBottom:'0.75rem' }}>By creating an account, you confirm that you are either (a) 18 years of age or older, or (b) between 13 and 17 years of age with parental consent and supervision.</p>
          <p>Mech.gg reserves the right to terminate any account where age requirements are not met. Parents who become aware of their minor child using this service without supervision should contact us at <a href="mailto:mechggofficial@gmail.com" style={{ color:'var(--accent)' }}>mechggofficial@gmail.com</a>.</p>
        </div>
      </section>

      {/* Refund Policy */}
      <section style={{ marginBottom:'2rem' }}>
        <h2 style={{ fontFamily:'var(--mono)', fontSize:'1rem', fontWeight:700, color:'var(--accent)', marginBottom:'1rem' }}>Refund Policy</h2>
        <div className="card" style={{ lineHeight:1.8, fontSize:'0.875rem', color:'var(--text-2)' }}>
          <p style={{ marginBottom:'0.75rem' }}>Mech.gg processes refunds on a <strong style={{ color:'var(--text)' }}>case-by-case basis</strong>. Submitting a refund request does not guarantee a refund. Only <strong style={{ color:'var(--text)' }}>viable refund requests</strong> will be processed.</p>
          
          <p style={{ fontWeight:600, color:'var(--text)', marginBottom:'0.35rem', marginTop:'1rem' }}>Refunds may be considered when:</p>
          <ul style={{ listStyle:'none', paddingLeft:'1rem' }}>
            {['You were charged in error or duplicate','A technical failure prevented you from using the service you paid for','You did not receive the features advertised for your plan','You request a refund within 48 hours of your first charge for a new plan'].map(item=>(
              <li key={item} style={{ marginBottom:'0.35rem' }}>✓ {item}</li>
            ))}
          </ul>

          <p style={{ fontWeight:600, color:'var(--text)', marginBottom:'0.35rem', marginTop:'1rem' }}>Refunds will NOT be issued for:</p>
          <ul style={{ listStyle:'none', paddingLeft:'1rem' }}>
            {['Dissatisfaction with analysis results or scores','Having used some or all of your monthly analyses','Forgetting to cancel before the renewal date','Requests made more than 30 days after the charge','Violations of our Terms of Use leading to account termination'].map(item=>(
              <li key={item} style={{ marginBottom:'0.35rem' }}>✗ {item}</li>
            ))}
          </ul>

          <p style={{ marginTop:'1rem' }}>To request a refund, go to <strong>Account → Billing → Request Refund</strong> or email <a href="mailto:mechggofficial@gmail.com" style={{ color:'var(--accent)' }}>mechggofficial@gmail.com</a> with your account email and reason. Allow 3–5 business days for review. Approved refunds are processed within 5–10 business days.</p>
        </div>
      </section>

      {/* Payment & Billing */}
      <section style={{ marginBottom:'2rem' }}>
        <h2 style={{ fontFamily:'var(--mono)', fontSize:'1rem', fontWeight:700, color:'var(--accent)', marginBottom:'1rem' }}>Payment & Billing</h2>
        <div className="card" style={{ lineHeight:1.8, fontSize:'0.875rem', color:'var(--text-2)' }}>
          <p style={{ marginBottom:'0.75rem' }}>Subscriptions are billed monthly. You may cancel at any time; your access continues until the end of the current billing period. Mech.gg does not offer prorated refunds for mid-cycle cancellations.</p>
          <p style={{ marginBottom:'0.75rem' }}>Payment processing is handled by Stripe. Mech.gg never stores your full card number or banking details. All payment data is encrypted and handled in compliance with PCI-DSS standards.</p>
          <p style={{ marginBottom:'0.75rem' }}><strong style={{ color:'var(--text)' }}>Coach & Student Transactions:</strong> All financial arrangements between coaches and students on Mech.gg are made entirely privately and independently, outside of this platform. Mech.gg does not process, facilitate, hold, or guarantee any payments between coaches and students. Mech.gg accepts no liability whatsoever for financial disputes, non-payment, or fraud arising from coach-student arrangements. Users engage in such arrangements at their own risk.</p>
          <p>For billing inquiries contact: <a href="mailto:mechggofficial@gmail.com" style={{ color:'var(--accent)' }}>mechggofficial@gmail.com</a></p>
        </div>
      </section>

      {/* Advertising */}
      <section style={{ marginBottom:'2rem' }}>
        <h2 style={{ fontFamily:'var(--mono)', fontSize:'1rem', fontWeight:700, color:'var(--accent)', marginBottom:'1rem' }}>Advertising</h2>
        <div className="card" style={{ lineHeight:1.8, fontSize:'0.875rem', color:'var(--text-2)' }}>
          <p style={{ marginBottom:'0.75rem' }}>Mech.gg displays third-party advertisements on certain pages. Advertisements are clearly labeled. Mech.gg does not endorse any advertised product or service.</p>
          <p style={{ marginBottom:'0.75rem' }}>Advertisers do not have access to your personal data or gameplay analysis results. Ad targeting, if used, is based only on general page context.</p>
          <p>To inquire about advertising on Mech.gg, contact: <a href="mailto:mechggofficial@gmail.com" style={{ color:'var(--accent)' }}>mechggofficial@gmail.com</a></p>
        </div>
      </section>

      {/* Trademarks */}
      <section style={{ marginBottom:'2rem' }}>
        <h2 style={{ fontFamily:'var(--mono)', fontSize:'1rem', fontWeight:700, color:'var(--accent)', marginBottom:'1rem' }}>Game Trademarks & Third-Party IP</h2>
        <div className="card" style={{ lineHeight:1.8, fontSize:'0.875rem', color:'var(--text-2)' }}>
          <p style={{ marginBottom:'0.75rem' }}>Mech.gg references game titles including Valorant (© Riot Games), CS2 (© Valve Corporation), EA FC / FIFA (© Electronic Arts), Street Fighter 6 (© Capcom), Tekken 8 (© Bandai Namco), StarCraft II (© Blizzard Entertainment), and others solely for the purpose of identifying the games users may upload clips from.</p>
          <p style={{ marginBottom:'0.75rem' }}>Mech.gg is <strong style={{ color:'var(--text)' }}>not affiliated with, endorsed by, sponsored by, or in any way officially connected</strong> with any of these game developers or publishers. All trademarks, service marks, and trade names belong to their respective owners.</p>
          <p>Use of any game name or trademark on Mech.gg does not imply any relationship with or endorsement by the trademark holder.</p>
        </div>
      </section>

      {/* Account Deletion */}
      <section style={{ marginBottom:'2rem' }}>
        <h2 style={{ fontFamily:'var(--mono)', fontSize:'1rem', fontWeight:700, color:'var(--accent)', marginBottom:'1rem' }}>Your Data Rights & Account Deletion</h2>
        <div className="card" style={{ lineHeight:1.8, fontSize:'0.875rem', color:'var(--text-2)' }}>
          <p style={{ marginBottom:'0.75rem' }}>You have the right to access, correct, export, and permanently delete your personal data. To delete your account and all associated data, go to <strong>Settings → Delete Account</strong> or email <a href="mailto:mechggofficial@gmail.com" style={{ color:'var(--accent)' }}>mechggofficial@gmail.com</a>.</p>
          <p>Payment records are retained for 7 years as required by law. All other personal data is deleted within 30 days of your request. See our <a href="/privacy" style={{ color:'var(--accent)' }}>Privacy Policy</a> for full details.</p>
        </div>
      </section>

      {/* Contact */}
      <section style={{ marginBottom:'2rem' }}>
        <h2 style={{ fontFamily:'var(--mono)', fontSize:'1rem', fontWeight:700, color:'var(--accent)', marginBottom:'1rem' }}>Contact Us</h2>
        <div className="card" style={{ lineHeight:1.8, fontSize:'0.875rem', color:'var(--text-2)' }}>
          <p>For all inquiries including billing, refunds, legal matters, advertising, abuse reports, and general support:</p>
          <div style={{ marginTop:'0.75rem', padding:'0.875rem', background:'var(--bg-elevated)', borderRadius:'var(--r)', fontFamily:'var(--mono)', fontSize:'0.875rem' }}>
            📧 <a href="mailto:mechggofficial@gmail.com" style={{ color:'var(--accent)' }}>mechggofficial@gmail.com</a>
          </div>
          <p style={{ marginTop:'0.75rem' }}>We aim to respond to all inquiries within 2 business days.</p>
        </div>
      </section>

      <DisclaimerBanner type="global" collapsed={false}/>
    </div>
  );
}
