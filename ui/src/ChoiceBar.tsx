import React, { useState } from 'react';
import { sendChoice } from './sendChoice';

export const ChoiceBar: React.FC<{ props?: any; tabId?: string }> = ({ props: p, tabId }) => {
    const choices = Array.isArray(p?.choices) ? p.choices : [];
    const ctxTab = p?.tabId || tabId;
    const locked = !!p?.awaitingGuide;
    const [busy, setBusy] = useState('');
    const [note, setNote] = useState('');
    const click = async (c: any) => {
        if (busy || locked) return;
        setBusy(c.id);
        setNote('');
        const res = await sendChoice({
            questTabId: p?.questTabId || ctxTab,
            tabId: p?.questTabId || ctxTab,
            chatSessionId: p?.chatSessionId,
            choiceId: c.id,
            label: c.label,
        });
        setNote(res.ok ? (c.id.startsWith('mundo:') ? 'Mundo listo. El guía pregunta el tema.' : 'El guía está hablando…') : res.error || 'Error');
        setBusy('');
    };
    return (
        <div style={{ marginTop: 12, opacity: locked ? 0.45 : 1, pointerEvents: locked ? 'none' : 'auto' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {choices.map((c: any) => (
                    <button
                        key={c.id}
                        type="button"
                        disabled={!!busy || locked}
                        onClick={() => click(c)}
                        style={{
                            fontSize: 16,
                            fontWeight: 700,
                            padding: '12px 18px',
                            borderRadius: 18,
                            border: '3px solid #7c3aed',
                            background: c.locked ? '#fde68a' : '#ddd6fe',
                            color: '#4c1d95',
                            cursor: busy || locked ? 'wait' : 'pointer',
                            boxShadow: '0 4px 0 #6d28d9',
                        }}
                    >
                        {c.locked ? '🔒 ' : ''}
                        {busy === c.id ? '…' : c.label}
                    </button>
                ))}
            </div>
            {note ? <div style={{ marginTop: 8, fontSize: 13, color: '#5b21b6' }}>{note}</div> : null}
        </div>
    );
};
