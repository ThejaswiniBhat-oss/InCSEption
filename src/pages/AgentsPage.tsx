import { useEffect, useState } from 'react';
import { fetchAgents } from '../services/api';
import type { Agent, AgentStatus } from '../types/api';
import styles from './AgentsPage.module.css';

const STATUS_CONFIG: Record<AgentStatus, { label: string; cls: string }> = {
  idle:      { label: 'Idle',      cls: 'badge--muted'   },
  running:   { label: 'Running',   cls: 'badge--info'    },
  completed: { label: 'Done',      cls: 'badge--success' },
  error:     { label: 'Error',     cls: 'badge--danger'  },
};

function AgentCard({ agent }: { agent: Agent }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[agent.status];

  return (
    <div className={`card ${styles.card} ${agent.status === 'running' ? styles.running : ''}`}>
      <div className={styles.cardHeader}>
        <div className={styles.nameRow}>
          <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
          {agent.status === 'running' && <span className={styles.pulse} aria-hidden="true" />}
        </div>
        <h3 className={styles.agentName}>{agent.name}</h3>
        <p className={styles.agentDesc}>{agent.description}</p>
      </div>

      {agent.detail && (
        <p className={styles.detail}>{agent.detail}</p>
      )}

      {agent.lastRun && (
        <p className={styles.lastRun}>
          Last run: {new Date(agent.lastRun).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
      )}

      {agent.logs && agent.logs.length > 0 && (
        <button
          className={styles.logsToggle}
          onClick={() => setExpanded(o => !o)}
          aria-expanded={expanded}
        >
          {expanded ? 'Hide' : 'Show'} logs
          <svg
            className={`${styles.chevron} ${expanded ? styles.chevronOpen : ''}`}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      )}

      {expanded && agent.logs && (
        <pre className={styles.logs}>
          {agent.logs.join('\n')}
        </pre>
      )}
    </div>
  );
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents().then(setAgents).finally(() => setLoading(false));
  }, []);

  return (
    <div className={`page ${styles.page}`}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>AI Agents</h1>
          <p className={styles.pageSub}>
            Background agents handle fraud detection, deduplication, and eligibility checks.
          </p>
        </div>

        {loading ? (
          <div className={styles.center}><span className="spinner" style={{ width: 28, height: 28 }} /></div>
        ) : (
          <div className={styles.list}>
            {agents.map(a => <AgentCard key={a.id} agent={a} />)}
          </div>
        )}
      </div>
    </div>
  );
}
