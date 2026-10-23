import { createContext } from 'react'
import type { Translate } from '../utils/_envs'

/**
 * The translator of the document a component renders in: the one the document a host mounts makes from its
 * `translate` prop, which the documents it nests use too (`translate` in `engine/rules.tsx`). The document makes a
 * new one when it is handed another `translate` or another `language`, and everything that reads this renders
 * again: every node of the document, a popup's content among them, which the popup keeps as an element, and every
 * `Text`, which takes it as its translator when it is handed none. `undefined` outside a document, and in one
 * given no `translate`: a component then takes the module default, `Active.translate`.
 */
export const TranslateContext = createContext<Translate | undefined>(undefined)
