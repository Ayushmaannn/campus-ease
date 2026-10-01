import React, { useState, useEffect } from 'react';

const DemoBanner = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (visible) {
      document.documentElement.style.setProperty('--demo-banner-height', '46px');
      document.body.style.paddingTop = '46px';
    } else {
      document.documentElement.style.setProperty('--demo-banner-height', '0px');
      document.body.style.paddingTop = '0px';
    }

    return () => {
      document.documentElement.style.setProperty('--demo-banner-height', '0px');
      document.body.style.paddingTop = '0px';
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        height: '46px',
        backgroundColor: '#dc2626',
        backgroundImage: 'linear-gradient(90deg, #b91c1c 0%, #dc2626 50%, #b91c1c 100%)',
        borderBottom: '3px solid #facc15',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Left Badge: High-contrast yellow pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <span
          style={{
            backgroundColor: '#fef08a',
            color: '#78350f',
            fontWeight: 900,
            fontSize: '11px',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            padding: '4px 10px',
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
          }}
        >
          <span>⚠️</span> PROTOTYPE DEMO
        </span>
      </div>

      {/* Center Static Bold Message */}
      <div
        style={{
          flex: 1,
          textAlign: 'center',
          padding: '0 14px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        <span
          style={{
            fontSize: '13px',
            fontWeight: 900,
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
            textShadow: '0 1px 3px rgba(0,0,0,0.6)',
            color: '#ffffff',
          }}
        >
          THIS IS JUST A DEMO — FULLY FUNCTIONAL PORTAL IS UNDER DEVELOPMENT
        </span>
        <span
          style={{
            display: 'inline-block',
            marginLeft: '12px',
            fontSize: '11px',
            fontWeight: 700,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            color: '#fef08a',
            padding: '2px 10px',
            borderRadius: '9999px',
            letterSpacing: '0.4px',
            border: '1px solid rgba(254, 240, 138, 0.3)',
          }}
        >
          Frontend Prototype for Evaluation
        </span>
      </div>

      {/* Right side branding & dismiss */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 800,
            color: '#fef08a',
            letterSpacing: '0.5px',
          }}
        >
          CampusEase
        </span>
        <button
          onClick={() => setVisible(false)}
          title="Dismiss notification"
          aria-label="Close demo banner"
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#ffffff',
            borderRadius: '4px',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 800,
            lineHeight: 1,
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default DemoBanner;
