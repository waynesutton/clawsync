import { Link, Outlet, useLocation } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import {
  ChartBar,
  Brain,
  Robot,
  Lightning,
  Plug,
  DeviceMobile,
  ChatCircle,
  ClipboardText,
  Gear,
  UsersThree,
  BookOpen,
  ListBullets,
  XLogo,
  EnvelopeSimple,
  Image,
  Browser,
  Globe,
  MagnifyingGlass,
  ChartLine,
  CloudArrowUp,
  Key,
} from '@phosphor-icons/react';
import './SyncBoard.css';

const navItems = [
  { path: '/syncboard', label: 'Overview', Icon: ChartBar },
  { path: '/syncboard/agents', label: 'Agents', Icon: UsersThree },
  { path: '/syncboard/souls', label: 'Souls', Icon: BookOpen },
  { path: '/syncboard/agent-feed', label: 'Agent Feed', Icon: ListBullets },
  { path: '/syncboard/soul', label: 'Soul Document', Icon: Brain },
  { path: '/syncboard/models', label: 'Models', Icon: Robot },
  { path: '/syncboard/skills', label: 'Skills', Icon: Lightning },
  { path: '/syncboard/mcp', label: 'MCP Servers', Icon: Plug },
  { path: '/syncboard/channels', label: 'Channels', Icon: DeviceMobile },
  { path: '/syncboard/x', label: 'X (Twitter)', Icon: XLogo },
  { path: '/syncboard/agentmail', label: 'AgentMail', Icon: EnvelopeSimple },
  { path: '/syncboard/media', label: 'Media', Icon: Image },
  { path: '/syncboard/stagehand', label: 'Stagehand', Icon: Browser },
  { path: '/syncboard/firecrawl', label: 'Firecrawl', Icon: Globe },
  { path: '/syncboard/research', label: 'Research', Icon: MagnifyingGlass },
  { path: '/syncboard/analytics', label: 'Analytics', Icon: ChartLine },
  { path: '/syncboard/memory', label: 'Memory', Icon: CloudArrowUp },
  { path: '/syncboard/api', label: 'API Keys', Icon: Key },
  { path: '/syncboard/threads', label: 'Threads', Icon: ChatCircle },
  { path: '/syncboard/activity', label: 'Activity Log', Icon: ClipboardText },
  { path: '/syncboard/config', label: 'Configuration', Icon: Gear },
];

export function SyncBoard() {
  const location = useLocation();
  const agentConfig = useQuery(api.agentConfig.get);
  const skills = useQuery(api.skillRegistry.list);
  const activities = useQuery(api.activityLog.list, { limit: 10 });
  const agents = useQuery(api.agents.list);

  const activeSkills = skills?.filter((s) => s.status === 'active' && s.approved).length ?? 0;
  const pendingSkills = skills?.filter((s) => s.status === 'pending' || !s.approved).length ?? 0;
  const runningAgents = agents?.filter((a: { status: string }) => a.status === 'running').length ?? 0;
  const totalAgents = agents?.length ?? 0;

  return (
    <div className="syncboard">
      <aside className="syncboard-sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">SyncBoard</h1>
          <Link to="/chat" className="btn btn-ghost text-sm">
            Back to Chat
          </Link>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon"><item.Icon size={18} weight="regular" /></span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="syncboard-main">
        {location.pathname === '/syncboard' ? (
          <div className="dashboard">
            <h2>Dashboard Overview</h2>

            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-value">{totalAgents}</span>
                <span className="stat-label">Total Agents</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{runningAgents}</span>
                <span className="stat-label">Running</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{agentConfig?.model || 'Not set'}</span>
                <span className="stat-label">Default Model</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{activeSkills}</span>
                <span className="stat-label">Active Skills</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{pendingSkills}</span>
                <span className="stat-label">Pending Approval</span>
              </div>
            </div>

            <section className="dashboard-section">
              <h3>Recent Activity</h3>
              {activities && activities.length > 0 ? (
                <ul className="activity-list-compact">
                  {activities.map((activity) => (
                    <li key={activity._id}>
                      <span className="activity-type">{activity.actionType}</span>
                      <span className="activity-summary">{activity.summary}</span>
                      <span className="activity-time">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-secondary">No recent activity</p>
              )}
            </section>

            <section className="dashboard-section">
              <h3>Quick Actions</h3>
              <div className="quick-actions">
                <Link to="/syncboard/agents" className="btn btn-primary">
                  Manage Agents
                </Link>
                <Link to="/syncboard/skills/new" className="btn btn-secondary">
                  Add Skill
                </Link>
                <Link to="/syncboard/souls" className="btn btn-secondary">
                  Manage Souls
                </Link>
                <Link to="/syncboard/models" className="btn btn-secondary">
                  Configure Model
                </Link>
              </div>
            </section>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}
