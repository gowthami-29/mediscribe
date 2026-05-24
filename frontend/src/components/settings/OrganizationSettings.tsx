import React from 'react';
import { useAuthStore } from '@/store/authStore';

const OrganizationSettings: React.FC = () => {
  const { user } = useAuthStore();

  const details = [
    { label: 'Organization ID', value: (user as any)?.organization_id },
    { label: 'Account Status', value: user?.status },
    { label: 'Organization Name', value: (user as any)?.organization_name || 'N/A' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>
          Organization Information
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
          Details about your healthcare facility and membership.
        </p>
      </div>

      <div style={{ display: 'grid', gap: 16 }} className="org-grid">
        {details.map((item) => (
          <div
            key={item.label}
            style={{
              padding: 16,
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 12,
            }}
          >
            <div style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: 'var(--text-4)',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              marginBottom: 6,
            }}>
              {item.label}
            </div>
            <div style={{
              fontSize: 13,
              fontFamily: 'monospace',
              color: 'var(--text-1)',
              wordBreak: 'break-all',
            }}>
              {item.value || '—'}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        padding: 16,
        background: 'var(--blue-light)',
        border: '1px solid var(--border)',
        borderRadius: 12,
      }}>
        <h4 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--blue)', marginBottom: 6 }}>
          Subscription Plan
        </h4>
        <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 12 }}>
          You are currently on the Professional Plan.
        </p>
        <button
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--blue)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            fontFamily: 'inherit',
            textDecoration: 'underline',
          }}
        >
          View Billing Details →
        </button>
      </div>
    </div>
  );
};

export default OrganizationSettings;
