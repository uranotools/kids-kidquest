import React, { useEffect, useState } from 'react';
import { PathMap } from './PathMap';
import { ChoiceBar } from './ChoiceBar';
import { sendChoice } from './sendChoice';

const CSS = `
@keyframes kqPulse { 0%,100%{ transform: translate(-50%,-50%) scale(1);} 50%{ transform: translate(-50%,-50%) scale(1.12);} }
@keyframes kqBounce { 0%,100%{ transform: translateY(0);} 50%{ transform: translateY(-10px);} }
@keyframes kqSpin { to { transform: rotate(360deg);} }
@keyframes kqDash { to { stroke-dashoffset: -20; } }
@keyframes kqPop { from { transform: scale(0.92); opacity: 0;} to { transform: scale(1); opacity: 1;} }
@keyframes kqWait { 0%,100%{ opacity: 0.55;} 50%{ opacity: 1;} }
`;

type Props = { props?: any; tabId?: string };

export const QuestBoard: React.FC<Props> = ({ props: p, tabId }) => {
    const ctx = { chatSessionId: p?.chatSessionId, tabId: p?.tabId || tabId };
    const waiting = !!p?.awaitingGuide;
    const quizWait = p?.waitingKind === 'quiz';
    const [showSkip, setShowSkip] = useState(false);
    useEffect(() => {
        if (!waiting) {
            setShowSkip(false);
            return;
        }
        const t = setTimeout(() => setShowSkip(true), 8000);
        return () => clearTimeout(t);
    }, [waiting, p?.nodeId, p?.waitingKind]);
    const skip = async () => {
        await sendChoice({
            questTabId: p?.questTabId || ctx.tabId,
            tabId: p?.questTabId || ctx.tabId,
            chatSessionId: p?.chatSessionId,
            choiceId: 'skip-wait',
            label: 'Ya leí',
        });
    };
    return (
        <div
            style={{
                padding: 18,
                minHeight: '100%',
                background: '#fff7ed',
                color: '#431407',
                fontFamily: 'ui-rounded, ui-sans-serif, system-ui',
                position: 'relative',
            }}
        >
            <style>{CSS}</style>
            <div style={{ fontSize: 12, color: '#c2410c', fontWeight: 700 }}>{p?.disclaimer}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <div>
                    <div style={{ fontSize: 26, fontWeight: 800 }}>{p?.title || 'Aventura'}</div>
                    <div style={{ fontSize: 16, color: '#9a3412' }}>
                        {p?.emoji} {p?.nodeTitle} · ⭐ {p?.stars ?? 0}
                        {p?.tema ? ` · Aprende: ${p.tema}` : ''}
                    </div>
                </div>
                {p?.goal ? <div style={{ fontSize: 28 }}>🎉</div> : null}
            </div>
            <div style={{ fontSize: 13, color: '#9a3412', marginTop: 6 }}>{p?.how}</div>
            <p style={{ fontSize: 18, lineHeight: 1.4, margin: '12px 0' }}>{p?.scene}</p>
            {p?.fase !== 'lobby' ? <PathMap props={{ nodes: p?.nodes, edges: p?.edges, waiting }} /> : null}
            <ChoiceBar
                props={{
                    choices: p?.choices,
                    questTabId: p?.questTabId,
                    chatSessionId: p?.chatSessionId,
                    tabId: ctx.tabId,
                    awaitingGuide: waiting,
                }}
                tabId={p?.questTabId || ctx.tabId}
            />
            {Array.isArray(p?.stamps) && p.stamps.length ? (
                <div style={{ marginTop: 14, fontSize: 22 }}>{p.stamps.map((s: string) => `🏅${s} `)}</div>
            ) : null}
            {waiting ? (
                <div
                    style={{
                        marginTop: 16,
                        background: 'rgba(76, 29, 149, 0.92)',
                        color: '#faf5ff',
                        borderRadius: 20,
                        padding: '16px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        animation: 'kqWait 1.4s ease-in-out infinite',
                    }}
                >
                    <div style={{ fontSize: 32, animation: 'kqBounce 0.9s ease-in-out infinite' }}>{quizWait ? '🧠' : p?.emoji || '🌟'}</div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 18 }}>
                            {quizWait ? 'Responde la pregunta en el chat' : 'El guía te está hablando…'}
                        </div>
                        <div style={{ fontSize: 14, opacity: 0.9 }}>Mira la tarjeta. Luego podrás elegir el siguiente paso.</div>
                        {showSkip && !quizWait ? (
                            <button
                                type="button"
                                onClick={skip}
                                style={{
                                    marginTop: 10,
                                    border: 'none',
                                    background: '#fde68a',
                                    color: '#78350f',
                                    fontWeight: 800,
                                    borderRadius: 12,
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                }}
                            >
                                Ya leí el chat
                            </button>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </div>
    );
};
