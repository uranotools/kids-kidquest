const jr = (globalThis as any).__URANO_JSONLIVE__?.jsxRuntime;
if (!jr) throw new Error('[urano-kidquest ui] jsxRuntime missing');
export const jsx = jr.jsx;
export const jsxs = jr.jsxs;
export const Fragment = jr.Fragment;
export const jsxDEV = jr.jsxDEV || jr.jsx;
