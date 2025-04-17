import { createContext } from 'react';

export const initialConfigState = {
    dateFormat: 'MM-DD-YYYY',
    currency: 'USD',
    language: 'en',
    updateConfig: () => {},
}

export const ConfigContext = createContext();
