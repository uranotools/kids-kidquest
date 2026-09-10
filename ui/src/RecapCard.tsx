import React, { useEffect } from 'react';
import { guideReady } from './sendChoice';

export const RecapCard: React.FC<{ props?: any; tabId?: string }> = ({ props: p, tabId }) => {
    const c = p || {};
    const learned: { q: string; given: string; ok: boolean }[] = Array.isArray(c.learned) ? c.learned : [];
    const ok = learned.filter((x) => x.ok).length;
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
                background: 'linear-gradient(180deg, #fce7f3, #e0e7ff)',
                border: '4px solid #db2777',
                borderRadius: 24,
                padding: 18,
                color: '#831843',
                fontFamily: 'ui-rounded, ui-sans-serif, system-ui',
                animation: 'kqPop 0.45s ease-out',
            }}
        >
            <div style={{ fontSize: 36 }}>{c.emoji || '📒'}</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{c.title || 'Hoy aprendió'}</div>
            <div style={{ fontSize: 15, marginTop: 6 }}>
                {c.tema ? <div>Tema: {c.tema}</div> : null}
                {c.mundo ? <div>Mundo: {c.mundo}</div> : null}
                <div style={{ marginTop: 4 }}>
                    Acertó {ok} de {learned.length || 0} preguntas.
                </div>
            </div>
            {learned.length ? (
                <ul style={{ margin: '10px 0 0', paddingLeft: 18, fontSize: 14 }}>
                    {learned.map((x, i) => (
                        <li key={i}>
                            {x.ok ? '✅' : '❌'} {x.q} → {x.given}
                        </li>
                    ))}
                </ul>
            ) : (
                <div style={{ marginTop: 8 }}>{c.text}</div>
            )}
            {c.stars != null ? <div style={{ marginTop: 10, fontWeight: 800 }}>⭐ {c.stars}</div> : null}
        </div>
    );
};
