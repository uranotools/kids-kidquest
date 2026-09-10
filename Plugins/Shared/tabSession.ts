/** MultiverseTab / bubble sessions must not run the parent Engine (avoids tab storms). */
export function isTabSession(ctx: any): boolean {
    try {
        const meta = typeof ctx.getMetadata === 'function' ? ctx.getMetadata() : {};
        if (meta?.isMultiverseTab) return true;
        const parent = meta?.parentSessionId;
        if (parent && String(parent) !== String(ctx.sessionId)) return true;
    } catch {
        /* older Desktop */
    }
    const id = String(ctx?.sessionId || '');
    if (id.startsWith('mvtab_') || id.startsWith('bubble')) return true;
    const agent = String(ctx?.agentId || '');
    if (agent.startsWith('multiverse')) return true;
    if (String(ctx?.userId || '') === 'multiverse') return true;
    return false;
}
