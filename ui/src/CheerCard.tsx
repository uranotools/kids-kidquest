import React, { useEffect } from 'react';
import { guideReady } from './sendChoice';

export const CheerCard: React.FC<{ props?: any; tabId?: string }> = ({ props: p, tabId }) => {
    const c = p || {};
    useEffect(() => {
        void guideReady({
            questTabId: c.questTabId,
            tabId: c.questTabId || (tabId && !String(tabId).startsWith('bubble') ? tabId : undefined),
            chatSessionId: c.chatSessionId,
        });
    }, [c.questTabId, c.chatSessionId, tabId]);
    return (
        <div
            style={{
                background: 'linear-gradient(180deg, #fef08a, #fdba74)',
                border: '4px solid #ea580c',
                borderRadius: 24,
                padding: 18,
                color: '#7c2d12',
                fontFamily: 'ui-rounded, ui-sans-serif, system-ui',
                boxShadow: '0 6px 0 #c2410c',
                animation: 'kqPop 0.45s ease-out',
            }}
        >
            <div style={{ fontSize: 36 }}>{c.emoji || '🌟'}</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{c.title || '¡Bien!'}</div>
            <div style={{ fontSize: 16, marginTop: 6 }}>{c.text}</div>
            {c.stars != null ? <div style={{ marginTop: 10, fontWeight: 700 }}>⭐ {c.stars}</div> : null}
        </div>
    );
};
