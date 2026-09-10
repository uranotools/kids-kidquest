import React from 'react';

type Node = { id: string; title: string; emoji?: string; x: number; y: number; here?: boolean; visited?: boolean; goal?: boolean };
type Edge = { from: string; to: string; walked?: boolean; locked?: boolean; here?: boolean };

export const PathMap: React.FC<{ props?: any }> = ({ props: p }) => {
    const nodes: Node[] = Array.isArray(p?.nodes) ? p.nodes : [];
    const edges: Edge[] = Array.isArray(p?.edges) ? p.edges : [];
    const waiting = !!p?.waiting;
    const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
    return (
        <div style={{ position: 'relative', height: 280, background: 'linear-gradient(#7dd3fc, #bbf7d0)', borderRadius: 20, overflow: 'hidden', border: '3px solid #0369a1' }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', left: 18, right: 18, top: 22, bottom: 28, width: 'calc(100% - 36px)', height: 'calc(100% - 50px)' }}>
                {edges.map((e, i) => {
                    const a = byId[e.from];
                    const b = byId[e.to];
                    if (!a || !b) return null;
                    return (
                        <line
                            key={`${e.from}-${e.to}-${i}`}
                            x1={a.x}
                            y1={a.y}
                            x2={b.x}
                            y2={b.y}
                            stroke={e.walked ? '#ca8a04' : e.here ? '#7c3aed' : '#64748b'}
                            strokeWidth={e.walked || e.here ? 2.2 : 1.4}
                            strokeDasharray={e.locked && !e.walked ? '4 3' : e.here ? '6 4' : undefined}
                            strokeLinecap="round"
                            style={e.here ? { animation: 'kqDash 1.2s linear infinite' } : undefined}
                        />
                    );
                })}
            </svg>
            <div style={{ position: 'absolute', left: 18, right: 18, top: 22, bottom: 28 }}>
            {nodes.map((n) => (
                <div
                    key={n.id}
                    title={n.title}
                    style={{
                        position: 'absolute',
                        left: `${n.x}%`,
                        top: `${n.y}%`,
                        transform: 'translate(-50%, -50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        zIndex: n.here ? 3 : 2,
                        animation: n.here ? 'kqPulse 1.1s ease-in-out infinite' : undefined,
                    }}
                >
                    <div
                        style={{
                            width: n.here ? 56 : 44,
                            height: n.here ? 56 : 44,
                            borderRadius: 999,
                            background: n.here ? '#fde047' : n.visited ? '#fff' : '#e0f2fe',
                            border: n.goal ? '3px solid #eab308' : n.here ? '3px solid #ca8a04' : '2px solid #38bdf8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: n.here ? 26 : 20,
                            boxShadow: n.here ? '0 4px 0 #ca8a04' : '0 2px 0 #7dd3fc',
                        }}
                    >
                        {n.emoji || '•'}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#0f172a', marginTop: 2, background: 'rgba(255,255,255,0.8)', padding: '1px 5px', borderRadius: 8, whiteSpace: 'nowrap' }}>
                        {n.title}
                    </div>
                </div>
            ))}
            </div>
            {waiting ? (
                <div style={{ position: 'absolute', right: 12, top: 12, fontSize: 22, animation: 'kqSpin 1.6s linear infinite' }}>✨</div>
            ) : null}
        </div>
    );
};
