import { describe_, identity } from './typescriptSupport'
import type { ToolchainProbe } from './typescriptSupport'

// The §9.6-E0 toolchain guard. See typescriptSupport.ts for why this exists.
// If this suite fails, TypeScript support is broken — not this file's logic.
describe('TypeScript toolchain (§9.6-E0)', () => {
    it('babel strips types and the module runs', () => {
        const probe: ToolchainProbe = { label: 'toolchain', count: 2 }

        expect(describe_(probe)).toBe('toolchain:2')
    })

    it('generics survive the transform', () => {
        expect(identity<number>(41) + 1).toBe(42)
    })
})
