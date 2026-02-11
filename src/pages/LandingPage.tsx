import React from "react";
import { useQuery } from "convex/react";
import { Link } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import {
  ChatCircle,
  Lightning,
  Lock,
  Rocket,
  Plug,
  Globe,
  Wrench,
  CheckCircle,
  DeviceMobile,
  Robot,
  Confetti,
  Key,
  ClipboardText,
  XLogo,
  EnvelopeSimple,
  Browser,
  ChartLine,
  MagnifyingGlass,
  CloudArrowUp,
  Image,
  UsersThree,
} from "@phosphor-icons/react";

export function LandingPage() {
  // Fetch public activity feed
  const publicActivity = useQuery(api.activityLog.listPublic, { limit: 10 });
  const agentConfig = useQuery(api.agentConfig.get);
  // Fetch tweets to display on landing (if enabled in SyncBoard)
  const landingTweets = useQuery(api.xTwitter.getLandingTweets, { limit: 5 });

  const agentName = agentConfig?.name || "ClawSync";

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="container">
          <div className="header-content">
            <Link to="/" className="logo-link">
              <img
                src="/clawsync-logo.svg"
                alt="ClawSync"
                className="logo-img"
                onError={(e) => {
                  e.currentTarget.src = "/clawsync-logo.png";
                }}
              />
            </Link>
            <nav className="header-nav">
              <a
                href="https://github.com/waynesutton/clawsync"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              <a
                href="https://docs.clawsync.dev"
                target="_blank"
                rel="noopener noreferrer"
              >
                Docs
              </a>
              <Link to="/chat" className="btn btn-primary">
                Try the Agent
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Your AI agent,
              <br />
              <span className="hero-highlight">open source</span>
            </h1>
            <p className="hero-description">
              Deploy a personal AI agent with chat UI, skills system, MCP
              support, and multi-model routing. Fork, customize, and own your AI
              experience.
            </p>
            <div className="hero-actions">
              <Link to="/chat" className="btn btn-primary btn-lg">
                Chat with {agentName}
              </Link>
              <a
                href="https://github.com/waynesutton/clawsync"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-lg"
              >
                View on GitHub
              </a>
            </div>
            <div className="hero-tech">
              <span className="tech-badge">React + TypeScript</span>
              <span className="tech-badge">Convex</span>
              <span className="tech-badge">WorkOS Auth</span>
              <span className="tech-badge">Multi-Model</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Everything you need</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <ChatCircle size={32} weight="regular" />
              </div>
              <h3>Public Chat UI</h3>
              <p>
                Clean, real-time chat interface with streaming responses and
                markdown support.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Lightning size={32} weight="regular" />
              </div>
              <h3>Skills System</h3>
              <p>
                Template skills, webhook skills, or code skills. Extend your
                agent with any capability.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Lock size={32} weight="regular" />
              </div>
              <h3>SyncBoard Admin</h3>
              <p>
                Private dashboard to configure your agent, manage skills, and
                monitor activity.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Rocket size={32} weight="regular" />
              </div>
              <h3>Multi-Model</h3>
              <p>
                Claude, GPT, Gemini, or any OpenRouter model. Switch providers
                without code changes.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Plug size={32} weight="regular" />
              </div>
              <h3>MCP Support</h3>
              <p>
                Connect to external MCP servers or expose your agent as an MCP
                server.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Globe size={32} weight="regular" />
              </div>
              <h3>Channel Integrations</h3>
              <p>
                Telegram, Discord, WhatsApp, Slack, Email. One agent, many
                channels.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <EnvelopeSimple size={32} weight="regular" />
              </div>
              <h3>AgentMail</h3>
              <p>
                Email inboxes for your agent. Send, receive, and process emails
                via API with rate limits.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Image size={32} weight="regular" />
              </div>
              <h3>File Storage</h3>
              <p>
                Upload and manage files with Convex native storage or Cloudflare
                R2 as an optional backend.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Browser size={32} weight="regular" />
              </div>
              <h3>Browser Automation</h3>
              <p>
                Extract data, perform actions, or run autonomous agents on any
                URL with Stagehand and Firecrawl.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <ChartLine size={32} weight="regular" />
              </div>
              <h3>AI Analytics</h3>
              <p>
                Weekly deep analysis of metrics with anomaly detection, trends,
                and recommendations. Manual trigger available.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <MagnifyingGlass size={32} weight="regular" />
              </div>
              <h3>Agent Research</h3>
              <p>
                Competitive analysis, topic research, and real-time X search.
                Connect external APIs for data gathering.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <CloudArrowUp size={32} weight="regular" />
              </div>
              <h3>Persistent Memory</h3>
              <p>
                Supermemory integration for long-term recall. Conversations
                stored automatically, context injected per query.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <UsersThree size={32} weight="regular" />
              </div>
              <h3>Multi-Agent System</h3>
              <p>
                Run multiple agents with independent configs, skills, MCP
                servers, and memory. Agents can interact with each other.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Activity Feed */}
      <section className="activity-section">
        <div className="container">
          <h2 className="section-title">Live Activity</h2>
          <p className="section-description">
            Public activity from the agent. See what it's doing in real-time.
          </p>
          <div className="activity-feed">
            {publicActivity === undefined ? (
              <div className="activity-loading">Loading activity...</div>
            ) : publicActivity.length === 0 ? (
              <div className="activity-empty">
                No public activity yet. Start a conversation to see activity
                here.
              </div>
            ) : (
              publicActivity.map(
                (activity: {
                  _id: string;
                  actionType: string;
                  summary: string;
                  timestamp: number;
                  channel?: string;
                }) => (
                  <div key={activity._id} className="activity-item">
                    <div className="activity-icon">
                      {getActivityIcon(activity.actionType)}
                    </div>
                    <div className="activity-content">
                      <p className="activity-summary">{activity.summary}</p>
                      <span className="activity-time">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                    {activity.channel && (
                      <span className="activity-channel">
                        {activity.channel}
                      </span>
                    )}
                  </div>
                ),
              )
            )}
          </div>
          <div className="activity-cta">
            <Link to="/chat" className="btn btn-primary">
              Start a Conversation
            </Link>
          </div>
        </div>
      </section>

      {/* Agent Tweets Section (only shows if enabled and has tweets) */}
      {landingTweets && landingTweets.length > 0 && (
        <section className="tweets-section">
          <div className="container">
            <h2 className="section-title">From X</h2>
            <p className="section-description">
              Recent posts from the agent on X (Twitter)
            </p>
            <div className="tweets-grid">
              {landingTweets.map(
                (tweet: {
                  _id: string;
                  tweetId: string;
                  text: string;
                  authorUsername: string;
                  authorDisplayName?: string;
                  authorProfileImageUrl?: string;
                  postedAt: number;
                  likeCount?: number;
                }) => (
                  <a
                    key={tweet._id}
                    href={`https://x.com/${tweet.authorUsername}/status/${tweet.tweetId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tweet-card"
                  >
                    <div className="tweet-header">
                      {tweet.authorProfileImageUrl && (
                        <img
                          src={tweet.authorProfileImageUrl}
                          alt=""
                          className="tweet-avatar"
                        />
                      )}
                      <div className="tweet-author-info">
                        <span className="tweet-display-name">
                          {tweet.authorDisplayName || tweet.authorUsername}
                        </span>
                        <span className="tweet-username">
                          @{tweet.authorUsername}
                        </span>
                      </div>
                      <span className="tweet-x-logo">
                        <XLogo size={20} weight="regular" />
                      </span>
                    </div>
                    <p className="tweet-text">{tweet.text}</p>
                    <div className="tweet-footer">
                      <span className="tweet-time">
                        {formatTimeAgo(tweet.postedAt)}
                      </span>
                      {tweet.likeCount !== undefined && (
                        <span className="tweet-likes">
                          {tweet.likeCount} likes
                        </span>
                      )}
                    </div>
                  </a>
                ),
              )}
            </div>
          </div>
        </section>
      )}

      {/* Quick Start */}
      <section className="quickstart">
        <div className="container">
          <h2 className="section-title">Get Started in Minutes</h2>
          <div className="quickstart-steps">
            <div className="step">
              <span className="step-number">1</span>
              <div className="step-content">
                <h4>Clone the repo</h4>
                <code className="step-code">
                  git clone https://github.com/waynesutton/clawsync.git
                </code>
              </div>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <div className="step-content">
                <h4>Install and run</h4>
                <code className="step-code">npm install && npx convex dev</code>
              </div>
            </div>
            <div className="step">
              <span className="step-number">3</span>
              <div className="step-content">
                <h4>Set your API key</h4>
                <code className="step-code">
                  ANTHROPIC_API_KEY in Convex Dashboard
                </code>
              </div>
            </div>
            <div className="step">
              <span className="step-number">4</span>
              <div className="step-content">
                <h4>Deploy</h4>
                <code className="step-code">npm run deploy</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <img
                src="/clawsync-logo.svg"
                alt="ClawSync"
                className="footer-logo"
                onError={(e) => {
                  e.currentTarget.src = "/clawsync-logo.png";
                }}
              />
              <p className="footer-tagline">Open source AI agent platform</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h5>Product</h5>
                <Link to="/chat">Chat</Link>
                <Link to="/syncboard">SyncBoard</Link>
                <a href="https://docs.clawsync.dev">Docs</a>
              </div>
              <div className="footer-column">
                <h5>Resources</h5>
                <a
                  href="https://github.com/waynesutton/clawsync"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
                <a
                  href="https://github.com/waynesutton/clawsync/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Issues
                </a>
                <a
                  href="https://discord.gg/clawsync"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Discord
                </a>
              </div>
              <div className="footer-column">
                <h5>Built With</h5>
                <a
                  href="https://convex.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Convex
                </a>
                <a
                  href="https://workos.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WorkOS
                </a>
                <a
                  href="https://vercel.com/font"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Geist
                </a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>MIT License. Fork it, own it.</p>
          </div>
        </div>
      </footer>

      <style>{`
        .landing-page {
          min-height: 100vh;
        }

        /* Header */
        .landing-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border);
          padding: var(--space-4) 0;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo-link {
          display: flex;
          align-items: center;
          text-decoration: none;
        }

        .logo-img {
          height: 36px;
          width: auto;
        }

        .header-nav {
          display: flex;
          align-items: center;
          gap: var(--space-6);
        }

        .header-nav a {
          color: var(--text-primary);
          text-decoration: none;
          font-weight: 500;
        }

        .header-nav a:hover {
          color: var(--interactive);
        }

        /* Hero */
        .hero {
          padding: var(--space-16) 0;
          text-align: center;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: var(--space-6);
        }

        .hero-highlight {
          color: var(--interactive);
        }

        .hero-description {
          font-size: var(--text-xl);
          color: var(--text-secondary);
          margin-bottom: var(--space-8);
          line-height: 1.6;
        }

        .hero-actions {
          display: flex;
          justify-content: center;
          gap: var(--space-4);
          margin-bottom: var(--space-8);
        }

        .btn-lg {
          padding: var(--space-3) var(--space-6);
          font-size: var(--text-lg);
        }

        .hero-tech {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .tech-badge {
          font-size: var(--text-xs);
          padding: var(--space-1) var(--space-3);
          background: var(--bg-secondary);
          border-radius: var(--radius-full);
          color: var(--text-secondary);
        }

        /* Features */
        .features {
          padding: var(--space-16) 0;
          background: var(--bg-secondary);
        }

        .section-title {
          text-align: center;
          font-size: var(--text-3xl);
          margin-bottom: var(--space-4);
        }

        .section-description {
          text-align: center;
          color: var(--text-secondary);
          margin-bottom: var(--space-8);
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-6);
          margin-top: var(--space-8);
        }

        .feature-card {
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
        }

        .feature-icon {
          margin-bottom: var(--space-4);
          color: var(--interactive);
        }

        .feature-card h3 {
          font-size: var(--text-lg);
          margin-bottom: var(--space-2);
        }

        .feature-card p {
          color: var(--text-secondary);
          margin: 0;
        }

        /* Activity Section */
        .activity-section {
          padding: var(--space-16) 0;
        }

        .activity-feed {
          max-width: 700px;
          margin: 0 auto var(--space-8);
          background: var(--bg-secondary);
          border-radius: var(--radius-xl);
          border: 1px solid var(--border);
          overflow: hidden;
        }

        .activity-loading,
        .activity-empty {
          padding: var(--space-8);
          text-align: center;
          color: var(--text-secondary);
        }

        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          padding: var(--space-4);
          border-bottom: 1px solid var(--border);
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-icon {
          font-size: var(--text-lg);
          flex-shrink: 0;
        }

        .activity-content {
          flex: 1;
          min-width: 0;
        }

        .activity-summary {
          margin: 0 0 var(--space-1);
          font-size: var(--text-sm);
        }

        .activity-time {
          font-size: var(--text-xs);
          color: var(--text-secondary);
        }

        .activity-channel {
          font-size: var(--text-xs);
          padding: var(--space-1) var(--space-2);
          background: var(--bg-primary);
          border-radius: var(--radius-full);
          color: var(--text-secondary);
        }

        .activity-cta {
          text-align: center;
        }

        /* Tweets Section */
        .tweets-section {
          padding: var(--space-16) 0;
          background: var(--bg-secondary);
        }

        .tweets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-4);
          max-width: 900px;
          margin: 0 auto;
        }

        .tweet-card {
          display: block;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: var(--space-4);
          text-decoration: none;
          color: inherit;
          transition: all var(--transition-fast);
        }

        .tweet-card:hover {
          border-color: var(--interactive);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .tweet-header {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-3);
        }

        .tweet-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }

        .tweet-author-info {
          flex: 1;
          min-width: 0;
        }

        .tweet-display-name {
          display: block;
          font-weight: 600;
          font-size: var(--text-sm);
        }

        .tweet-username {
          display: block;
          font-size: var(--text-xs);
          color: var(--text-secondary);
        }

        .tweet-x-logo {
          font-size: var(--text-xl);
          color: var(--text-secondary);
        }

        .tweet-text {
          font-size: var(--text-sm);
          line-height: 1.5;
          margin: 0 0 var(--space-3);
        }

        .tweet-footer {
          display: flex;
          justify-content: space-between;
          font-size: var(--text-xs);
          color: var(--text-secondary);
        }

        /* Quick Start */
        .quickstart {
          padding: var(--space-16) 0;
          background: var(--bg-primary);
        }

        .quickstart-steps {
          max-width: 700px;
          margin: var(--space-8) auto 0;
        }

        .step {
          display: flex;
          gap: var(--space-4);
          margin-bottom: var(--space-4);
          background: var(--bg-primary);
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
        }

        .step-number {
          width: 32px;
          height: 32px;
          background: var(--interactive);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          flex-shrink: 0;
        }

        .step-content h4 {
          margin-bottom: var(--space-2);
        }

        .step-code {
          display: block;
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          background: var(--bg-secondary);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          overflow-x: auto;
        }

        /* Footer */
        .landing-footer {
          padding: var(--space-12) 0 var(--space-6);
          border-top: 1px solid var(--border);
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          gap: var(--space-8);
          margin-bottom: var(--space-8);
        }

        .footer-brand {
          max-width: 200px;
        }

        .footer-logo {
          height: 32px;
          width: auto;
        }

        .footer-tagline {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin-top: var(--space-2);
        }

        .footer-links {
          display: flex;
          gap: var(--space-12);
        }

        .footer-column {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .footer-column h5 {
          font-size: var(--text-sm);
          font-weight: 600;
          margin-bottom: var(--space-2);
        }

        .footer-column a {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }

        .footer-column a:hover {
          color: var(--interactive);
        }

        .footer-bottom {
          text-align: center;
          padding-top: var(--space-6);
          border-top: 1px solid var(--border);
        }

        .footer-bottom p {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin: 0;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .hero-actions {
            flex-direction: column;
          }

          .footer-content {
            flex-direction: column;
          }

          .footer-links {
            flex-wrap: wrap;
            gap: var(--space-6);
          }
        }
      `}</style>
    </div>
  );
}

// Helper functions
function getActivityIcon(actionType: string): React.ReactNode {
  const iconProps = { size: 18, weight: "regular" as const };
  const icons: Record<string, React.ReactNode> = {
    chat_message: <ChatCircle {...iconProps} />,
    skill_invocation: <Lightning {...iconProps} />,
    skill_created: <Wrench {...iconProps} />,
    skill_approved: <CheckCircle {...iconProps} />,
    channel_message: <DeviceMobile {...iconProps} />,
    agent_response: <Robot {...iconProps} />,
    setup_complete: <Confetti {...iconProps} />,
    syncboard_login: <Key {...iconProps} />,
    x_post: <XLogo {...iconProps} />,
    x_reply: <XLogo {...iconProps} />,
    default: <ClipboardText {...iconProps} />,
  };
  return icons[actionType] || icons.default;
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
