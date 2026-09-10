import React, { useState } from 'react';
import { sendChoice } from './sendChoice';

export const QuizCard: React.FC<{ props?: any; tabId?: string }> = ({ props: p, tabId }) => {
    const c = p || {};
    const options: string[] = Array.isArray(c.options) ? c.options : [];
    const [busy, setBusy] = useState(false);
    const [note, setNote] = useState('');
    const questTabId = c.questTabId || (tabId && !String(tabId).startsWith('bubble') ? tabId : undefined);
    const pick = async (answer: string) => {
        if (busy || !c.choiceId) return;
        setBusy(true);
        const res = await sendChoice({
            questTabId,
            chatSessionId: c.chatSessionId,
            choiceId: c.choiceId,
            answer,
        });
        setNote(res.ok ? '¡Bien! Mira el mapa y espera al guía.' : res.error || '');
        setBusy(false);
    };
    return (
        <div
            style={{
                background: '#e0e7ff',
                border: '4px solid #4f46e5',
                borderRadius: 24,
                padding: 18,
                color: '#1e1b4b',
                fontFamily: 'ui-rounded, ui-sans-serif, system-ui',
                animation: 'kqPop 0.45s ease-out',
            }}
        >
            <div style={{ fontSize: 14, fontWeight: 800, color: '#4338ca' }}>{c.title || 'Pregunta'}</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginTop: 6 }}>{c.question || c.text}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {options.map((o) => (
                    <button
                        key={o}
                        type="button"
                        disabled={busy}
                        onClick={() => pick(o)}
                        style={{
                            fontSize: 16,
                            fontWeight: 700,
                            padding: '10px 16px',
                            borderRadius: 16,
                            border: '3px solid #4338ca',
                            background: '#c7d2fe',
                            cursor: busy ? 'wait' : 'pointer',
                        }}
                    >
                        {o}
                    </button>
                ))}
            </div>
            {c.text && c.question ? <div style={{ marginTop: 10, fontSize: 14 }}>{c.text}</div> : null}
            {note ? <div style={{ marginTop: 8, fontSize: 13 }}>{note}</div> : null}
        </div>
    );
};
