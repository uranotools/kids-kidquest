import React, { useEffect } from 'react';
import { guideReady } from './sendChoice';

export const StampCard: React.FC<{ props?: any; tabId?: string }> = ({ props: p, tabId }) => {
    const c = p || {};
    const stamps: string[] = Array.isArray(c.stamps) ? c.stamps : [];
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
                background: '#fce7f3',
                border: '4px solid #db2777',
                borderRadius: 24,
                padding: 18,
                color: '#831843',
                fontFamily: 'ui-rounded, ui-sans-serif, system-ui',
                animation: 'kqPop 0.45s ease-out',
            }}
        >
            <div style={{ fontSize: 22, fontWeight: 800 }}>{c.title || 'Sellos'}</div>
            <div style={{ fontSize: 16, marginTop: 4 }}>{c.text}</div>
            <div style={{ marginTop: 12, fontSize: 20, lineHeight: 1.6 }}>
                {stamps.length ? stamps.map((s) => `🏅 ${s}`).join('   ') : 'Aún no hay sellos. ¡Explora!'}
            </div>
            {c.stars != null ? <div style={{ marginTop: 10, fontWeight: 800 }}>⭐ {c.stars}</div> : null}
        </div>
    );
};
