import React, { useState } from "react";

export default function Landing() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "Do I need a credit card to start?",
      a: "No. Your 14-day free trial starts immediately with no credit card required. Full access to all features from day one.",
    },
    {
      q: "How fast can I get set up?",
      a: "Most agents are fully set up in about 2 minutes. Import your contacts, connect your calendar, and start quoting.",
    },
    {
      q: "Does BindFlow include an AI generator?",
      a: "Yes. You can generate personalized client emails and follow-ups in seconds using our built-in tools.",
    },
    {
      q: "What is the Commission Forecaster?",
      a: "It analyzes your active pipeline and projects your estimated commissions based on policy premiums and close dates.",
    },
    {
      q: "Can I manage my team inside BindFlow?",
      a: "Yes. You can add up to 3 team members per workspace to keep your agency coordinated as you grow.",
    },
    {
      q: "What's included in the client portal?",
      a: "A secure, branded dashboard where clients can view policy progress, documents, and updates.",
    },
    {
      q: "Can I cancel anytime?",
      a: "Yes. There are no long-term contracts. You can cancel your subscription at any time from your account settings.",
    },
    {
      q: "Is it mobile-friendly?",
      a: "Absolutely. BindFlow has a fully responsive mobile app so you can manage your pipeline and contacts from anywhere.",
    },
  ];

  return (
    <div className="landing-page">
      {/* NAV */}
      <nav>
        <a href="#" className="nav-logo">
          <img
            src="https://fsmzsskfsonlrwfcvkji.supabase.co/storage/v1/object/sign/assets/Logo_BindFlow_redondo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hNTRhMGNiOC0zZTljLTQzODktYWQ1OS05YjZjNWY2NGQ2MDEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvTG9nb19CaW5kRmxvd19yZWRvbmRvLnBuZyIsImlhdCI6MTc3NzgwMTg3NSwiZXhwIjozMzMxMzgwMTg3NX0.VC-tMEAn6bHmLlumrfwXz4tf6Y-6xZ0DX9sG06eyFlE"
            alt="BindFlow Logo"
            style={{ width: "32px", height: "32px" }}
          />
          BindFlow
        </a>
        <ul className="nav-links">
          <li>
            <a href="#features">Features</a>
          </li>
          <li>
            <a href="#pricing">Pricing</a>
          </li>
          <li>
            <a href="#faq">FAQ</a>
          </li>
          <li>
            <a href="/app/login">Login</a>
          </li>
        </ul>
        <div className="nav-actions">
          <a href="/app/register" className="btn btn-primary">
            Start Free Trial
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" id="home">
        <div className="hero-inner">
          <div>
            <div className="hero-badge fade-up">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="4" fill="currentColor" />
              </svg>
              Built to help agents close faster
            </div>
            <h1
              className="hero-title fade-up"
              style={{ animationDelay: ".1s" }}
            >
              Pipeline That Flows.
              <br />
              <span className="dim">Policies That Grow.</span>
            </h1>
            <p className="hero-desc fade-up" style={{ animationDelay: ".2s" }}>
              The premium, zero-clutter CRM built specifically for independent
              insurance agents. Stop drowning in admin work, automate your
              renewals, and close more policies.
            </p>
            <div
              className="hero-actions fade-up"
              style={{ animationDelay: ".3s" }}
            >
              <a href="/app/register" className="btn btn-primary btn-lg">
                Start 14-Day Free Trial
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{ marginLeft: "8px" }}
                >
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
              <a href="#pricing" className="btn btn-outline btn-lg">
                See Pricing
              </a>
            </div>
            <div
              className="hero-trust fade-up"
              style={{ animationDelay: ".4s" }}
            >
              <span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle
                    cx="7"
                    cy="7"
                    r="6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M4.5 7l2 2 3-3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                No credit card required
              </span>
              <span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle
                    cx="7"
                    cy="7"
                    r="6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M4.5 7l2 2 3-3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Setup in 2 minutes
              </span>
            </div>
          </div>

          {/* Mockup */}
          <div className="hero-visual float">
            <div className="mockup-wrap">
              <div className="mockup-header">
                <div
                  className="mockup-dot"
                  style={{ background: "#F85149" }}
                ></div>
                <div
                  className="mockup-dot"
                  style={{ background: "#F0B429" }}
                ></div>
                <div
                  className="mockup-dot"
                  style={{ background: "var(--accent)" }}
                ></div>
                <div className="mockup-tabs">
                  <div className="mockup-tab active">Pipeline</div>
                  <div className="mockup-tab">Contacts</div>
                </div>
              </div>
              <div className="mockup-stats">
                <div className="mock-stat">
                  <div className="mock-stat-label">Active Quotes</div>
                  <div className="mock-stat-val">24</div>
                  <div className="mock-stat-sub" style={{ color: "#00B4D8" }}>
                    ↑ 3 this week
                  </div>
                </div>
                <div className="mock-stat">
                  <div className="mock-stat-label">Renewals (30d)</div>
                  <div className="mock-stat-val">7</div>
                  <div className="mock-stat-sub" style={{ color: "#F85149" }}>
                    Needs action
                  </div>
                </div>
                <div className="mock-stat">
                  <div className="mock-stat-label">Cross-Sell</div>
                  <div className="mock-stat-val">4</div>
                  <div className="mock-stat-sub">Opportunities</div>
                </div>
                <div className="mock-stat">
                  <div className="mock-stat-label">Premium MTD</div>
                  <div className="mock-stat-val">$12K</div>
                  <div className="mock-stat-sub">↑ 15% vs last</div>
                </div>
              </div>
              <div className="mockup-pipeline">
                <div className="pipeline-col">
                  <div className="pipeline-col-header">
                    <div
                      className="pipeline-col-dot"
                      style={{ background: "#8B949E" }}
                    ></div>{" "}
                    Lead
                  </div>
                  <div className="pipeline-card">
                    <div className="pipeline-card-name">Rodriguez Family</div>
                    <div className="pipeline-card-sub">Auto + Home</div>
                    <div
                      className="pipeline-card-tag"
                      style={{
                        color: "#8B949E",
                        background: "rgba(139, 148, 158, 0.15)",
                      }}
                    >
                      New
                    </div>
                  </div>
                </div>
                <div className="pipeline-col">
                  <div className="pipeline-col-header">
                    <div
                      className="pipeline-col-dot"
                      style={{ background: "#00B4D8" }}
                    ></div>{" "}
                    Quoted
                  </div>
                  <div className="pipeline-card">
                    <div className="pipeline-card-name">Thompson LLC</div>
                    <div className="pipeline-card-sub">Commercial GL</div>
                    <div
                      className="pipeline-card-tag"
                      style={{
                        color: "#00B4D8",
                        background: "rgba(0, 180, 216, 0.15)",
                      }}
                    >
                      $2,400
                    </div>
                  </div>
                </div>
                <div className="pipeline-col">
                  <div className="pipeline-col-header">
                    <div
                      className="pipeline-col-dot"
                      style={{ background: "#00E5A0" }}
                    ></div>{" "}
                    Active Policy
                  </div>
                  <div className="pipeline-card">
                    <div className="pipeline-card-name">M. Chen</div>
                    <div className="pipeline-card-sub">Term Life</div>
                    <div className="pipeline-card-tag">Won</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT IS BINDFLOW */}
      <section className="what-is" id="about">
        <div className="section-inner">
          <div className="what-is-grid">
            <div className="what-is-text">
              <h2 className="section-title" style={{ textAlign: "left" }}>
                What is BindFlow?
              </h2>
              <p
                style={{
                  fontSize: "17px",
                  color: "var(--text2)",
                  lineHeight: 1.75,
                  marginBottom: "32px",
                }}
              >
                BindFlow is a premium CRM designed to help independent insurance
                agents manage leads, renewals, and cross-selling in one focused
                workspace.
              </p>
              <div className="what-is-highlight">
                It replaces cluttered spreadsheets and scattered tools with a
                clean, modern system that keeps every policy moving forward —
                from first quote to automated renewal.
              </div>
              <div
                className="what-is-badges"
                style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
              >
                <div className="wi-badge">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2 7h10M7 2l5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  Secure workflows
                </div>
                <div className="wi-badge">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle
                      cx="7"
                      cy="7"
                      r="5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M7 4v3l2 2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  Conversion focused
                </div>
              </div>
            </div>

            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--card-border)",
                borderRadius: "var(--radius-lg)",
                padding: "28px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: "var(--text3)",
                  marginBottom: "20px",
                }}
              >
                Renewal Radar
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    background: "var(--bg3)",
                    border: "1px solid var(--card-border)",
                    borderRadius: "8px",
                    padding: "14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--white)",
                        marginBottom: "3px",
                      }}
                    >
                      Garcia Family · Auto
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text3)" }}>
                      Progressive · $1,200/yr
                    </div>
                  </div>
                  <div
                    style={{
                      background: "rgba(248, 81, 73, 0.15)",
                      color: "#F85149",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    In 12 Days
                  </div>
                </div>
                <div
                  style={{
                    background: "var(--bg3)",
                    border: "1px solid var(--card-border)",
                    borderRadius: "8px",
                    padding: "14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--white)",
                        marginBottom: "3px",
                      }}
                    >
                      Kim · Homeowners
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text3)" }}>
                      Travelers · $950/yr
                    </div>
                  </div>
                  <div
                    style={{
                      background: "rgba(240, 180, 41, 0.15)",
                      color: "#F0B429",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    In 45 Days
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing">
        <div className="section-inner">
          <div className="pricing-wrap">
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--text3)",
                  marginBottom: "8px",
                }}
              >
                Pricing that converts
              </div>
              <h2
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "clamp(28px, 3vw, 40px)",
                  color: "var(--white)",
                  marginBottom: "12px",
                }}
              >
                One plan.
                <br />
                Everything included.
              </h2>
              <p
                style={{
                  fontSize: "15px",
                  color: "var(--text2)",
                  marginBottom: "40px",
                }}
              >
                No feature tiers, no surprise add-ons. One flat price that
                unlocks everything BindFlow has to offer for up to 3 users.
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginBottom: "40px",
                }}
              >
                <div className="toggle-pill">
                  <div
                    className={`toggle-opt ${!isAnnual ? "active" : ""}`}
                    onClick={() => setIsAnnual(false)}
                  >
                    Monthly
                  </div>
                  <div
                    className={`toggle-opt ${isAnnual ? "active" : ""}`}
                    onClick={() => setIsAnnual(true)}
                  >
                    Annual
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--accent)",
                    fontWeight: 600,
                  }}
                >
                  Annual billing saves 15%
                </span>
              </div>

              <div className="price-card">
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--text3)",
                    marginBottom: "6px",
                  }}
                >
                  Features included
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "4px",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "24px",
                      fontWeight: 700,
                      color: "var(--text2)",
                    }}
                  >
                    $
                  </span>
                  <span className="price-number">{isAnnual ? "33" : "39"}</span>
                  <span style={{ fontSize: "15px", color: "var(--text3)" }}>
                    / month
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--accent)",
                    marginBottom: "24px",
                    fontWeight: 500,
                  }}
                >
                  {isAnnual
                    ? "$397/year · Annual billing saves 15%"
                    : "Billed monthly — switch to annual to save"}
                </div>
                <ul style={{ listStyle: "none", marginBottom: "28px" }}>
                  {[
                    "Full contact & policy management",
                    "Kanban pipeline — drag-and-drop stages",
                    "Automated 90/60/30 day renewal alerts",
                    "Cross-sell opportunity engine",
                    "Direct WhatsApp integration",
                    "Up to 3 seats per workspace",
                  ].map((feat, i) => (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        fontSize: "14px",
                        color: "var(--text2)",
                        padding: "7px 0",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        style={{ color: "var(--accent)", flexShrink: 0 }}
                      >
                        <circle
                          cx="8"
                          cy="8"
                          r="7"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M5 8l2 2 4-4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pricing-right">
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  marginBottom: "12px",
                }}
              >
                Free Trial
              </div>
              <h3
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--white)",
                  marginBottom: "16px",
                  lineHeight: 1.3,
                }}
              >
                Start selling smarter today.
              </h3>
              <p
                style={{
                  fontSize: "15px",
                  color: "var(--text2)",
                  marginBottom: "28px",
                  lineHeight: 1.7,
                }}
              >
                Get immediate access to the full product. Track leads, quotes,
                and renewals in one place.
              </p>

              <div
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--card-border)",
                  borderRadius: "var(--radius)",
                  padding: "20px",
                  marginBottom: "28px",
                }}
              >
                <h4
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--accent)",
                    marginBottom: "12px",
                  }}
                >
                  Referrals (Growth Engine)
                </h4>
                <ul style={{ listStyle: "none" }}>
                  {[
                    "Your referred friends get a 28-day extended trial.",
                    "You earn 1 FREE month when they pay their first invoice.",
                    "Zero limits on how many free months you can earn.",
                  ].map((text, i) => (
                    <li
                      key={i}
                      style={{
                        fontSize: "13px",
                        color: "var(--text2)",
                        padding: "5px 0",
                        display: "flex",
                        gap: "8px",
                      }}
                    >
                      <span style={{ color: "var(--accent)" }}>→</span> {text}
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href="/app/register"
                className="btn btn-primary btn-lg"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  marginTop: "28px",
                }}
              >
                Start Your Free Trial Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="why" id="faq">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>
          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`faq-item ${openFaq === index ? "open" : ""}`}
                onClick={() => toggleFaq(index)}
              >
                <button className="faq-q">
                  {faq.q}
                  <div className="faq-icon">+</div>
                </button>
                <div className="faq-a">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <a href="#" className="nav-logo">
          <img
            src="https://fsmzsskfsonlrwfcvkji.supabase.co/storage/v1/object/sign/assets/Logo_BindFlow_redondo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hNTRhMGNiOC0zZTljLTQzODktYWQ1OS05YjZjNWY2NGQ2MDEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvTG9nb19CaW5kRmxvd19yZWRvbmRvLnBuZyIsImlhdCI6MTc3NzgwMTg3NSwiZXhwIjozMzMxMzgwMTg3NX0.VC-tMEAn6bHmLlumrfwXz4tf6Y-6xZ0DX9sG06eyFlE"
            alt="BindFlow Logo"
            style={{ width: "24px", height: "24px" }}
          />
          BindFlow
        </a>
        <div className="footer-links">
          <a href="#">Terms of Service</a>
          <a href="#">Privacy Policy</a>
        </div>
        <div style={{ fontSize: "13px", color: "var(--text3)" }}>
          © 2026 BindFlow CRM. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
