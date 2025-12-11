// src/pages/SurfaceScanPage.jsx
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import AnimatedPage from '@/components/AnimatedPage';

// ---- Fake results generator (front-end only for now) ----
const fakeResultsForDomain = (domain) => {
  // Very simple deterministic-ish fake so similar domains feel similar
  const baseScore =
    domain.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 41; // 0–40
  const score = 55 + Math.round(baseScore / 2); // 55–75

  const riskLevel =
    score >= 72 ? 'Low' : score >= 62 ? 'Moderate' : 'High';

  return {
    domain,
    score,
    riskLevel,
    https: {
      status: 'OK',
      tech: 'Responds over HTTPS with no obvious certificate errors during this surface pass.',
      human:
        'We can safely reach your site over HTTPS right now. This is not a full encryption or certificate audit.',
    },
    edge: {
      status: 'Exposed',
      tech: 'No Cloudflare-style edge proxy or WAF detected in front of the origin in public DNS.',
      human:
        'Your site appears to connect directly to the internet without an extra shield in front.',
    },
    speed: {
      status: 'Moderate',
      tech: 'Average round-trip latency for a simple HTTPS request; no stress or load conditions simulated.',
      human:
        'Feels fine for day-to-day browsing, but may struggle during heavy traffic or basic attack conditions.',
    },
    hosting: {
      status: 'Neutral',
      tech: 'Public signals only indicate the likely hosting provider and region, not configuration quality.',
      human:
        'The provider is just the building; security depends on how the server and site inside are configured.',
    },
  };
};

// ---- Helper to (later) create a PDF download ----
const generateAndDownloadReport = (payload) => {
  // TODO: Replace this with real PDF generation.
  // For now we just log so nothing breaks.
  console.log('Report payload (implement PDF later):', payload);
  alert('Report download will be implemented soon. We still saved your scan details.');
};

// ---- Single row: IT text on the left, visual tile on the right ----
const ResultRow = ({ label, techSummary, statusLabel, visualSummary }) => {
  const statusClass = statusLabel
    ? `status-${statusLabel.toLowerCase()}`
    : '';

  return (
    <div className="scan-result-row">
      <div className="scan-result-left">
        <h4>{label}</h4>
        <p>{techSummary}</p>
      </div>
      <div className={`scan-result-right ${statusClass}`}>
        <div className="scan-result-pill">
          {statusLabel || 'Info'}
        </div>
        <p className="scan-result-visual">{visualSummary}</p>
      </div>
    </div>
  );
};

// ---- Results block (score card + rows) ----
const ScanResults = ({ results }) => {
  if (!results) return null;

  const { domain, score, riskLevel, https, edge, speed, hosting } = results;

  return (
    <section className="scan-results">
      <h2 className="scan-results-title">
        Surface scan summary for <span>{domain}</span>
      </h2>

      <div className="scan-results-header-card">
        <div className="score-main">
          <span className="score-label">Composite surface score</span>
          <span className="score-value">{score}/100</span>
        </div>

        <div className="score-risk">
          <span>Risk level:</span>
          <span className={`risk-badge risk-${riskLevel.toLowerCase()}`}>
            {riskLevel}
          </span>
        </div>

        <div className="score-meter">
          <span className={`meter-segment ${riskLevel === 'Low' ? 'active' : ''}`}>
            Low
          </span>
          <span className={`meter-segment ${riskLevel === 'Moderate' ? 'active' : ''}`}>
            Moderate
          </span>
          <span className={`meter-segment ${riskLevel === 'High' ? 'active' : ''}`}>
            High
          </span>
        </div>

        <p className="score-note">
          This is a high-level surface check using public information only. It highlights
          where an AI-powered SEO & security uplift is likely to deliver the biggest
          resilience gains.
        </p>
      </div>

      <div className="scan-results-rows">
        <ResultRow
          label="HTTPS reachability"
          techSummary={https.tech}
          statusLabel={https.status}
          visualSummary={https.human}
        />

        <ResultRow
          label="Edge / shield in front of your site"
          techSummary={edge.tech}
          statusLabel={edge.status}
          visualSummary={edge.human}
        />

        <ResultRow
          label="Round-trip speed (latency)"
          techSummary={speed.tech}
          statusLabel={speed.status}
          visualSummary={speed.human}
        />

        <ResultRow
          label="Hosting signal"
          techSummary={hosting.tech}
          statusLabel={hosting.status}
          visualSummary={hosting.human}
        />
      </div>
    </section>
  );
};

// ---- Grant helper (WEB ONLY, not used in PDF) ----
const GrantApplicationHelper = ({ results }) => {
  if (!results) return null;

  const { score, riskLevel, domain } = results;

  return (
    <section className="grant-helper">
      <h3>Grant Application Helper</h3>
      <p>
        If you&apos;re working with a government-funded digital or cyber advisor, you
        can use this surface scan as supporting evidence that your website needs
        resilience and security uplift.
      </p>

      <div className="grant-helper-summary">
        <div>
          <span className="helper-label">Domain</span>
          <span className="helper-value">{domain}</span>
        </div>
        <div>
          <span className="helper-label">Surface score</span>
          <span className="helper-value">
            {score}/100 ({riskLevel} risk)
          </span>
        </div>
      </div>

      <ol className="grant-helper-steps">
        <li>
          Share this scan summary with your advisor and highlight the surface score and
          risk level.
        </li>
        <li>
          Ask them which cyber / digital uplift programs apply to security-focused work
          on your website.
        </li>
        <li>
          Use Urban Sentinel as the technical delivery partner for AI-driven SEO and
          security hardening.
        </li>
      </ol>

      <p className="grant-helper-note">
        These funding programs are independent of Urban Sentinel. We provide the
        technical uplift and documentation; they help you navigate funding and broader
        resilience planning.
      </p>
    </section>
  );
};

// ---- Scan form ----
const ScanForm = ({ onComplete, loading }) => {
  const [domainInput, setDomainInput] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const handleRunScan = (e) => {
    e.preventDefault();
    if (!domainInput.trim()) return;

    const cleanDomain = domainInput
      .replace(/^https?:\/\//i, '')
      .replace(/\/.*$/, '')
      .trim()
      .toLowerCase();

    const results = fakeResultsForDomain(cleanDomain);
    onComplete({ results, email });
  };

  const handleDownloadAndSave = async (results) => {
    if (!results) return;
    if (!email.trim()) {
      alert('Please add your email so we can send your report.');
      return;
    }

    const payload = {
      domain: results.domain,
      email: email.trim(),
      results,
      createdAt: new Date().toISOString(),
    };

    // 1) local download stub (PDF later)
    generateAndDownloadReport(payload);

    // 2) send to Urban Sentinel backend (for follow-up)
    try {
      setSaving(true);
      await fetch('/api/store-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Failed to send report to Urban Sentinel', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="scan-form" onSubmit={handleRunScan}>
      <h1 className="scan-title">Surface scan your domain</h1>
      <p className="scan-intro">
        Enter your primary website domain. We&apos;ll run a lightweight, automated
        surface check using public information only — focusing on basic speed, HTTPS
        reachability and whether your DNS suggests an edge shield in front of your
        site.
      </p>

      <div className="scan-input-row">
        <span className="scan-input-prefix">https://</span>
        <input
          type="text"
          placeholder="example.com.au"
          value={domainInput}
          onChange={(e) => setDomainInput(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Scanning…' : 'Run surface scan'}
        </button>
      </div>

      <div className="scan-email-row">
        <label>
          <span>Report email (optional but recommended)</span>
          <input
            type="email"
            placeholder="you@business.com.au"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <p className="scan-email-note">
          If you request a report, we&apos;ll email you a copy and may follow up once
          after 7 days to see if you want help implementing the uplift.
        </p>
      </div>

      {/* This button will be wired by parent once results exist */}
      {/* Parent will pass a handler down if needed; see page component below */}
    </form>
  );
};

// ---- Full page wiring everything together ----
const SurfaceScanPage = () => {
  const [latestResults, setLatestResults] = useState(null);
  const [latestEmail, setLatestEmail] = useState('');

  const handleFormComplete = ({ results, email }) => {
    setLatestResults(results);
    if (email) setLatestEmail(email);
  };

  const handleDownloadReportClick = async () => {
    if (!latestResults) return;
    if (!latestEmail) {
      alert('Add your email in the form above so we can send your report.');
      return;
    }

    const payload = {
      domain: latestResults.domain,
      email: latestEmail.trim(),
      results: latestResults,
      createdAt: new Date().toISOString(),
    };

    generateAndDownloadReport(payload);

    try {
      await fetch('/api/store-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Failed to send report to Urban Sentinel', err);
    }
  };

  return (
    <AnimatedPage>
      <Helmet>
        <title>AI Surface Scan | Urban Sentinel</title>
        <meta
          name="description"
          content="Run a lightweight AI-assisted surface scan of your website to see basic security and performance signals, then use the results to plan your next uplift."
        />
      </Helmet>

      <div className="scan-page">
        <ScanForm onComplete={handleFormComplete} />

        {latestResults && (
          <>
            <ScanResults results={latestResults} />

            <div className="scan-report-actions">
              <button onClick={handleDownloadReportClick}>
                Download &amp; email my scan summary
              </button>
              <p>
                We&apos;ll store a copy of this scan for Urban Sentinel only so we can
                follow up once after 7 days if you haven&apos;t already booked a
                consultation.
              </p>
            </div>

            <GrantApplicationHelper results={latestResults} />
          </>
        )}
      </div>
    </AnimatedPage>
  );
};

export default SurfaceScanPage;
