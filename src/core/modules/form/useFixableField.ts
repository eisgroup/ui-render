import { useEffect, useLayoutEffect } from 'react'
import { holdFixableField } from '../../state/formRegistry'

// Before the browser paints, as the field's other mount effects run. On the server, where no effect runs,
// an effect: React 16 and 17 warn about a layout effect there.
const useBeforePaintEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/** What the hook reads of a field's props. */
export type FixableFieldProps = {
    /** The document the field belongs to, whose form it is counted in */
    instance?: { form?: object }
    name: string
    disabled?: unknown
    readonly?: unknown
}

/**
 * Counts a field among its form's fields whose error the user can fix while it is mounted and can be
 * changed: neither disabled nor readonly (`holdFixableField`, `state/formRegistry`). `asField` and
 * `asInputDateField` call it, the two that show a field's error. A field rendered without a document has
 * no form to count in.
 *
 * A module of its own, measured 2026-10-23: with a hook defined in `utils.tsx`, the React Compiler's lint
 * checks the components that file's factories build, and reports each ref they read as they render.
 */
export function useFixableField ({ instance, name, disabled, readonly }: FixableFieldProps): void {
    const form = instance && instance.form
    const fixable = !disabled && !readonly
    useBeforePaintEffect(() => {
        if (!form || !fixable) return
        return holdFixableField(form, name)
    }, [form, name, fixable])
}
