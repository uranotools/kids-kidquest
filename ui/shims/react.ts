const React = (globalThis as any).__URANO_JSONLIVE__?.React;
if (!React) {
    throw new Error('[urano-kidquest ui] window.__URANO_JSONLIVE__.React missing');
}
export default React;
export const {
    useState, useEffect, useMemo, useCallback, useRef, useContext,
    createElement, Fragment, Component, memo, createContext, Children, cloneElement,
} = React;
