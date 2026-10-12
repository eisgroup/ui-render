import React, { useEffect, useLayoutEffect, useState } from 'react'

/** Before paint in a browser, so a renamed id never paints; `useEffect` on the server, where neither runs. */
const useBeforePaintEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/** Ids handed to a renamed field and not yet released: two renamed in one commit must not pick the same. */
const claimed = new Set<string>()

/**
 * An id a field derives from its name or its label, kept unique on the page.
 *
 * A derived id is the same for every field with that name or label, and a `<label for>` or an
 * `aria-describedby` finds the FIRST element with the id. Two such fields on one page, in one document
 * (the `popupContent` example renders the same table in its popup and behind it, and the nested rows of
 * `nestedDataKind` repeat their names) or in two documents with the same meta, had the second's label
 * name the first: clicking it changed the other field, and the second field had no name at all. So the field that has the id first keeps it, as every field did,
 * and another takes the next free `<id>-2`, `<id>-3`… once it is in the document. Before paint, so
 * nothing paints with the shared id. A renamed field keeps the id it took for as long as it derives the
 * same one. An id a meta gives is the host's, and is left alone: pass nothing for it.
 *
 * `Checkbox` had this alone until 2026-10-09; `Input`, `InputNumber`, `InputDate` and the popup root
 * of `AppWrapper` share it since.
 *
 * @param derived - the id derived from the name or the label, or nothing when the meta gives one
 * @param own - the field's element: the one that carries the id, or one that contains it
 * @returns the id to render: `derived`, or the free one this field took instead
 */
export function useOwnId (derived: string | undefined, own: React.RefObject<Element | null>): string | undefined {
  const [renamed, setRenamed] = useState<{ from: string, to: string } | null>(null)
  useBeforePaintEffect(() => {
    const element = own.current
    if (!derived || !element) return undefined
    const holder = document.getElementById(derived)
    if (holder === null || holder === element || element.contains(holder)) return undefined
    let n = 2
    while (document.getElementById(`${derived}-${n}`) || claimed.has(`${derived}-${n}`)) n += 1
    const ownId = `${derived}-${n}`
    claimed.add(ownId)
    setRenamed({ from: derived, to: ownId })
    return () => { claimed.delete(ownId) }
  }, [derived, own])
  return renamed && renamed.from === derived ? renamed.to : derived
}
