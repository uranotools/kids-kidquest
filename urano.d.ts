declare module '@core/PluginBase' {
    export class PluginBase { constructor(config: any); }
}
declare module '@core/Security/Vault' {
    export class Vault { static getSecret(module: string, key: string): string; }
    export const moduleVaultContext: { exit(fn: () => void): void; run(key: string, fn: () => any): any };
}
declare module '@core/Router' {
    export const Router: any;
}
declare module '@core/CoreFactory' {
    export const CoreFactory: { getSessionManager(): Promise<any> };
}
declare module '@core/ChatHistoryManager' {
    export const ChatHistoryManager: { getSession?(id: string): any };
}
declare module '@core/PluginCore' {
    export const PluginCore: {
        launchUI(opts: any): Promise<any>;
        updateUI(opts: any): Promise<any>;
        focusTab(tabId: string): Promise<void>;
        addBadge(opts: any): Promise<void>;
    };
}
declare module '@core/EnginePluginBase' {
    export interface EnginePreProcessResult {
        status: 'continue' | 'intercepted';
        overrideResponse?: string;
        modifiedMessage?: any;
    }
    export interface ContextEngineResult {
        key: string;
        content: string;
        priority?: number;
    }
    export abstract class EnginePluginBase {
        protected readonly config: any;
        constructor(config: any);
        onSessionStart?(ctx: any): Promise<void>;
        preMessageProcess?(ctx: any, message: any): Promise<EnginePreProcessResult>;
        getContextEngine?(ctx: any): Promise<ContextEngineResult | null>;
    }
}
declare module '@core/runtime/SessionContext' {
    export class PluginStore {
        getSession<T = any>(key: string): Promise<T | null>;
        setSession(key: string, value: any): Promise<void>;
    }
    export class SessionContext {
        readonly sessionId: string;
        readonly store: PluginStore;
        appendCustomInstructions(text: string): void;
        addBadge(badge: any): void;
        getSecretWithOverride(key: string): string | null;
    }
}
