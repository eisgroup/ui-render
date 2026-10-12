import { createContext } from 'react'

/**
 * The column labels of the table around a body row, by position: what a `TableCells` row names the fields in its cells
 * by (`engine/mapper.tsx`), as a header's `renderCell` names its field through the column `TableView` hands it. Each is
 * the header's label, translated, when it is the plain text the header shows. `null` outside a table body, and in the
 * vertical layout, where a row's cells are not under the headers. `TableView` provides it.
 */
export const TableColumnsContext = createContext<Array<string | undefined> | null>(null)
