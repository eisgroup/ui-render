import { createContext } from 'react';

/**
 * Default configuration, and the shape of the context: `AppProvider` seeds its state
 * with it, and `ConfigOverride` falls back to it when a renderer is mounted outside any
 * provider.
 *
 * @Note: the callback is named `setConfig` because that is the name the provider actually
 * exposes (`AppProvider`). It was declared here as `updateConfig` while the provider
 * supplied `setConfig`, so anything trusting this declaration called a function that did
 * not exist (UPGRADE-PLAN §2.6-2).
 */
/** The formatting a document renders with, and the call that changes it. */
export type ConfigState = {
    dateFormat: string
    currency: string
    language: string
    setConfig: (config: Partial<Omit<ConfigState, 'setConfig'>>) => void
}

export const initialConfigState: ConfigState = {
    dateFormat: 'MM-DD-YYYY',
    currency: 'USD',
    language: 'en',
    setConfig: () => {},
}

// No default value: outside a provider the context is `undefined`, which `ConfigOverride` falls back from.
export const ConfigContext = createContext<ConfigState | undefined>(undefined);
