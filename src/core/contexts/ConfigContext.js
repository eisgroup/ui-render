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
export const initialConfigState = {
    dateFormat: 'MM-DD-YYYY',
    currency: 'USD',
    language: 'en',
    setConfig: () => {},
}

export const ConfigContext = createContext();
