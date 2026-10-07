/** A base16 color scheme: sixteen slots, `base00`-`base07` from background to foreground, then hues. */
export type Base16Theme = {
  scheme?: string
  author?: string
  base00: string, base01: string, base02: string, base03: string,
  base04: string, base05: string, base06: string, base07: string,
  base08: string, base09: string, base0A: string, base0B: string,
  base0C: string, base0D: string, base0E: string, base0F: string,
}

const nicinabox: Base16Theme = {
  scheme: 'nicinabox',
  author: 'nicinabox (http://github.com/nicinabox)',
  base00: 'rgba(0, 0, 0, 0)', // modified to match site's background
  base01: '#3C444F',
  base02: '#4F5A65',
  base03: '#BEBEBE',
  base04: '#b0b0b0', // based on ocean theme
  base05: '#d0d0d0', // based on ocean theme
  base06: '#FFFFFF',
  base07: '#f5f5f5', // based on ocean theme
  base08: '#fb9fb1', // based on ocean theme
  base09: '#FC6D24',
  base0A: '#ddb26f', // based on ocean theme
  base0B: '#A1C659',
  base0C: '#12cfc0', // based on ocean theme
  base0D: '#6FB3D2',
  base0E: '#D381C3',
  base0F: '#deaf8f'  // based on ocean theme
}

export default nicinabox
