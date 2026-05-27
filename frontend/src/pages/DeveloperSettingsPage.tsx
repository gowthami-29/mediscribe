import React, { useState } from 'react';
import { Key, Plus, Copy, Check, Trash2, Code, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface APIKey {
  id: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export default function DeveloperSettingsPage() {
  const [keys, setKeys] = useState<APIKey[]>([
    { id: '1', prefix: 'sk_live_1a2b', createdAt: '2026-05-20', lastUsedAt: '2026-05-26' }
  ]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateKey = async () => {
    setIsGenerating(true);
    // Simulate API call to generate key
    setTimeout(() => {
      const generated = 'sk_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      setNewKey(generated);
      setKeys([
        ...keys, 
        { 
          id: Math.random().toString(), 
          prefix: generated.substring(0, 12), 
          createdAt: new Date().toISOString().split('T')[0], 
          lastUsedAt: null 
        }
      ]);
      setIsGenerating(false);
      toast.success('New API Key generated successfully');
    }, 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
  };

  const revokeKey = (id: string) => {
    setKeys(keys.filter(k => k.id !== id));
    toast.success('API Key revoked');
  };

  return (
    <div className="fade-in" style={{ paddingBottom: 40 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-1)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Code size={24} color="var(--violet)" />
          Developer & API Settings
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
          Manage your organization's API keys for B2B system integration (e.g., Epic, Cerner).
        </p>
      </div>

      {newKey && (
        <div style={{ 
          background: 'rgba(16, 185, 129, 0.1)', 
          border: '1px solid rgba(16, 185, 129, 0.3)', 
          borderRadius: 8, 
          padding: 20, 
          marginBottom: 24 
        }}>
          <h3 style={{ color: '#10b981', fontSize: 16, fontWeight: 600, margin: '0 0 8px 0' }}>Save Your New API Key</h3>
          <p style={{ color: 'var(--text-2)', fontSize: 14, margin: '0 0 16px 0' }}>
            Please copy this key and save it somewhere secure. For security reasons, <strong>we will not show it again</strong>.
          </p>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: 'var(--surface-1)', 
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '12px 16px'
          }}>
            <code style={{ flex: 1, color: 'var(--text-1)', fontSize: 14, fontFamily: 'monospace' }}>{newKey}</code>
            <button 
              onClick={() => copyToClipboard(newKey)}
              style={{
                background: 'transparent',
                border: 'none',
                color: copied ? '#10b981' : 'var(--text-3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 500
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      <div style={{ 
        background: 'var(--surface-2)', 
        border: '1px solid var(--border)', 
        borderRadius: 12, 
        overflow: 'hidden' 
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '16px 20px', 
          borderBottom: '1px solid var(--border)' 
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: 'var(--text-1)' }}>Active API Keys</h2>
          <button 
            onClick={handleGenerateKey}
            disabled={isGenerating}
            style={{
              background: 'var(--violet)',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 500,
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              opacity: isGenerating ? 0.7 : 1
            }}
          >
            <Plus size={16} />
            {isGenerating ? 'Generating...' : 'Generate New Key'}
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px 20px', fontSize: 12, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase' }}>Key Prefix</th>
              <th style={{ padding: '12px 20px', fontSize: 12, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase' }}>Created</th>
              <th style={{ padding: '12px 20px', fontSize: 12, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase' }}>Last Used</th>
              <th style={{ padding: '12px 20px', fontSize: 12, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>
                  No API keys generated yet.
                </td>
              </tr>
            ) : (
              keys.map((key) => (
                <tr key={key.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ 
                      width: 32, height: 32, borderRadius: 8, 
                      background: 'rgba(124, 58, 237, 0.1)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--violet)'
                    }}>
                      <Key size={16} />
                    </div>
                    <code style={{ fontSize: 14, color: 'var(--text-1)' }}>{key.prefix}...</code>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: 14, color: 'var(--text-2)' }}>{key.createdAt}</td>
                  <td style={{ padding: '16px 20px', fontSize: 14, color: 'var(--text-2)' }}>{key.lastUsedAt || 'Never'}</td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <button 
                      onClick={() => revokeKey(key.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: 6,
                        padding: '6px 12px',
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <Trash2 size={14} />
                      Revoke
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 32 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)', marginBottom: 16 }}>Integration Example</h3>
        <div style={{ 
          background: '#1e1e1e', 
          borderRadius: 8, 
          padding: '16px',
          overflowX: 'auto',
          border: '1px solid var(--border)'
        }}>
          <pre style={{ margin: 0, color: '#d4d4d4', fontSize: 13, fontFamily: 'monospace' }}>
            <span style={{ color: '#569cd6' }}>curl</span> -X POST https://api.mediscribe.ai/v1/b2b/analyze-xray \
            <br />
            &nbsp;&nbsp;-H <span style={{ color: '#ce9178' }}>"Authorization: Bearer sk_live_your_key_here"</span> \
            <br />
            &nbsp;&nbsp;-H <span style={{ color: '#ce9178' }}>"Content-Type: multipart/form-data"</span> \
            <br />
            &nbsp;&nbsp;-F <span style={{ color: '#ce9178' }}>"file=@patient_xray.dcm"</span>
          </pre>
        </div>
      </div>
    </div>
  );
}
