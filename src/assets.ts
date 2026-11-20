// ===== ASSET MANIFEST =====
// Maps logical asset names to actual file paths
// Sizes are display sizes (px) at 800x600 room resolution
// Source images are ~6x larger (4800x3584 room)

export interface SpriteAsset {
  path: string
  width: number     // display width in px
  height: number    // display height in px
  category: 'character' | 'furniture' | 'appliance' | 'decoration' | 'effect' | 'culture' | 'room'
}

// All available sprite assets — sizes derived from actual image dimensions / scale
export const ASSETS: Record<string, SpriteAsset> = {
  // === CHARACTERS (307x862 source → ~51x144 display... too tall, scale to fit ~65px height) ===
  'char-debugger':       { path: '/sprites/debugger.png', width: 24, height: 65, category: 'character' },
  'char-reviewer':       { path: '/sprites/reviewer.png', width: 24, height: 65, category: 'character' },
  'char-frontend':       { path: '/sprites/frontend.png', width: 24, height: 65, category: 'character' },
  'char-fullstack':      { path: '/sprites/fullstack.png', width: 24, height: 65, category: 'character' },
  'char-tester':         { path: '/sprites/tester.png', width: 24, height: 65, category: 'character' },
  'char-security':       { path: '/sprites/security.png', width: 24, height: 65, category: 'character' },
  'char-devops':         { path: '/sprites/devops.png', width: 24, height: 65, category: 'character' },
  'char-manager':        { path: '/sprites/manager.png', width: 24, height: 65, category: 'character' },

  // === FURNITURE ===
  // Standing desks: ~580x720 source → ~97x120 at 6x... scale to ~70px wide
  'desk-standing-left-front':  { path: '/sprites/furniture/standing-desk-left-front.png', width: 84, height: 106, category: 'furniture' },
  'desk-standing-left-rear':   { path: '/sprites/furniture/standing-desk-left-rear.png', width: 84, height: 102, category: 'furniture' },
  'desk-standing-right-front': { path: '/sprites/furniture/standing-desk-right-front.png', width: 84, height: 106, category: 'furniture' },
  'desk-standing-right-rear':  { path: '/sprites/furniture/standing-desk-right-rear.png', width: 84, height: 102, category: 'furniture' },
  // Filing cabinet: 312x422 → ~52x70, scaled 1.2x
  'filing-closed':             { path: '/sprites/furniture/filling-closed.png', width: 42, height: 56, category: 'furniture' },
  'filing-open':               { path: '/sprites/furniture/filling-open.png', width: 46, height: 60, category: 'furniture' },

  // === THE OTHER ROOMS' FURNITURE (src/rooms.ts) ===
  // Cut from ChatGPT sheets drawn in the office's style, saved at twice these
  // sizes. Why these heights: on the 754 px stage a character is 78 px and a
  // standing desk 106 px, so a rack stands well over a person and a chair
  // reaches about their waist; the meeting table seats four a side.
  'meeting-table':             { path: '/sprites/rooms/meeting-table.webp', width: 234, height: 160, category: 'furniture' },
  'meeting-chair-front-right': { path: '/sprites/rooms/meeting-chair-front-right.webp', width: 34, height: 52, category: 'furniture' },
  'meeting-chair-rear-left':   { path: '/sprites/rooms/meeting-chair-rear-left.webp', width: 36, height: 47, category: 'furniture' },
  'lux-table': { path: '/sprites/rooms/lux-table.webp', width: 234, height: 160, category: 'furniture' },
  'exec-chair-front-right': { path: '/sprites/rooms/exec-chair-front-right.webp', width: 34, height: 52, category: 'furniture' },
  'exec-chair-rear-left': { path: '/sprites/rooms/exec-chair-rear-left.webp', width: 36, height: 47, category: 'furniture' },
  'lux-rug': { path: '/sprites/rooms/lux-rug.webp', width: 431, height: 207, category: 'furniture' },
  'credenza': { path: '/sprites/rooms/credenza.webp', width: 182, height: 140, category: 'furniture' },
  'boss-chair': { path: '/sprites/rooms/boss-chair.webp', width: 46, height: 80, category: 'furniture' },
  'srv-rack-lux-1': { path: '/sprites/rooms/srv-rack-lux-1.webp', width: 66, height: 125, category: 'furniture' },
  'srv-rack-lux-2': { path: '/sprites/rooms/srv-rack-lux-2.webp', width: 66, height: 125, category: 'furniture' },
  'srv-rack-lux-3': { path: '/sprites/rooms/srv-rack-lux-3.webp', width: 66, height: 125, category: 'furniture' },
  'srv-rack-lux-4': { path: '/sprites/rooms/srv-rack-lux-4.webp', width: 66, height: 125, category: 'furniture' },
  'srv-rack-lux-5': { path: '/sprites/rooms/srv-rack-lux-5.webp', width: 66, height: 125, category: 'furniture' },
  'srv-rack-lux-6': { path: '/sprites/rooms/srv-rack-lux-6.webp', width: 66, height: 125, category: 'furniture' },
  'srv-ups': { path: '/sprites/rooms/srv-ups.webp', width: 81, height: 117, category: 'furniture' },
  'srv-crac': { path: '/sprites/rooms/srv-crac.webp', width: 145, height: 153, category: 'furniture' },
  'srv-status-wall': { path: '/sprites/rooms/srv-status-wall.webp', width: 146, height: 122, category: 'furniture' },
  'srv-cable-tray': { path: '/sprites/rooms/srv-cable-tray.webp', width: 246, height: 131, category: 'furniture' },
  'cafe-snack': { path: '/sprites/rooms/cafe-snack.webp', width: 83, height: 142, category: 'furniture' },
  'cafe-drinks': { path: '/sprites/rooms/cafe-drinks.webp', width: 71, height: 137, category: 'furniture' },
  'cafe-serving': { path: '/sprites/rooms/cafe-serving.webp', width: 162, height: 133, category: 'furniture' },
  'cafe-salad': { path: '/sprites/rooms/cafe-salad.webp', width: 121, height: 101, category: 'furniture' },
  'cafe-hightop': { path: '/sprites/rooms/cafe-hightop.webp', width: 118, height: 110, category: 'furniture' },
  'cafe-booth': { path: '/sprites/rooms/cafe-booth.webp', width: 158, height: 131, category: 'furniture' },
  'cafe-sofa': { path: '/sprites/rooms/cafe-sofa.webp', width: 106, height: 82, category: 'furniture' },
  'cafe-communal': { path: '/sprites/rooms/cafe-communal.webp', width: 173, height: 107, category: 'furniture' },
  'cafe-powertable': { path: '/sprites/rooms/cafe-powertable.webp', width: 103, height: 86, category: 'furniture' },
  'cafe-trays': { path: '/sprites/rooms/cafe-trays.webp', width: 81, height: 106, category: 'furniture' },
  'cafe-kiosk': { path: '/sprites/rooms/cafe-kiosk.webp', width: 56, height: 104, category: 'furniture' },
  'cafe-menu': { path: '/sprites/rooms/cafe-menu.webp', width: 62, height: 158, category: 'furniture' },
  'whiteboard-mobile':         { path: '/sprites/rooms/whiteboard-mobile.webp', width: 62, height: 90, category: 'furniture' },
  'server-rack-1':             { path: '/sprites/rooms/server-rack-1.webp', width: 66, height: 125, category: 'furniture' },
  'server-rack-2':             { path: '/sprites/rooms/server-rack-2.webp', width: 67, height: 125, category: 'furniture' },
  'server-rack-3':             { path: '/sprites/rooms/server-rack-3.webp', width: 68, height: 125, category: 'furniture' },
  'network-cabinet':           { path: '/sprites/rooms/network-cabinet.webp', width: 68, height: 100, category: 'furniture' },
  'crash-cart':                { path: '/sprites/rooms/crash-cart.webp', width: 55, height: 80, category: 'furniture' },
  'kitchen-counter':           { path: '/sprites/rooms/kitchen-counter.webp', width: 132, height: 81, category: 'furniture' },
  'fridge':                    { path: '/sprites/rooms/fridge.webp', width: 44, height: 82, category: 'appliance' },
  'vending-machine':           { path: '/sprites/rooms/vending-machine.webp', width: 56, height: 84, category: 'appliance' },
  'water-cooler':              { path: '/sprites/rooms/water-cooler.webp', width: 24, height: 62, category: 'appliance' },
  'cafe-table':                { path: '/sprites/rooms/cafe-table.webp', width: 64, height: 58, category: 'furniture' },
  'cafe-chair-front-left':     { path: '/sprites/rooms/cafe-chair-front-left.webp', width: 36, height: 53, category: 'furniture' },
  'cafe-chair-front-right':    { path: '/sprites/rooms/cafe-chair-front-right.webp', width: 36, height: 53, category: 'furniture' },
  'cafe-chair-rear-left':      { path: '/sprites/rooms/cafe-chair-rear-left.webp', width: 34, height: 47, category: 'furniture' },
  'cafe-chair-rear-right':     { path: '/sprites/rooms/cafe-chair-rear-right.webp', width: 34, height: 47, category: 'furniture' },

  // === APPLIANCES ===
  // Coffee machine: 296x378 → ~49x63
  'coffee-off':    { path: '/sprites/appliances/coffee-off.png', width: 40, height: 51, category: 'appliance' },
  'coffee-on':     { path: '/sprites/appliances/coffee-on.png', width: 40, height: 51, category: 'appliance' },

  // === DECORATION ===
  // Monstera: 394x563 → ~66x94
  'plant-monstera':  { path: '/sprites/decoration/monstera-plant.png', width: 50, height: 71, category: 'decoration' },
  // Snake plant: 347x543 → ~58x91
  'plant-snake':     { path: '/sprites/decoration/snake-plant.png', width: 40, height: 63, category: 'decoration' },
  // Money tree: 351x531 → ~59x89
  'plant-money':     { path: '/sprites/decoration/money-tree.png', width: 42, height: 63, category: 'decoration' },
  // Whiteboard: 750x996 → ~125x166
  'whiteboard':      { path: '/sprites/decoration/white-board.png', width: 65, height: 86, category: 'decoration' },
  // AC unit: 492x380 → ~82x63
  'ac-unit':         { path: '/sprites/decoration/ac-wall-unit.png', width: 50, height: 39, category: 'decoration' },
  // Printer: 450x563 → ~75x94
  'printer':         { path: '/sprites/decoration/printer.png', width: 55, height: 69, category: 'decoration' },
  'printer-working': { path: '/sprites/decoration/printer-working.png', width: 55, height: 69, category: 'decoration' },
  'printer-broken':  { path: '/sprites/decoration/printer-broken.png', width: 55, height: 69, category: 'decoration' },

  // === CULTURE ===
  // Bell: 167x331 → ~28x55
  'bell':              { path: '/sprites/culture/bell.png', width: 18, height: 36, category: 'culture' },
  // Days last incident: 1241x1024 → ~207x171
  'days-last-incident': { path: '/sprites/culture/days-last-incident.png', width: 80, height: 66, category: 'culture' },
  // Deploying screen: 852x991 → ~142x165
  'deploying-screen':  { path: '/sprites/culture/deploying-screen.png', width: 60, height: 70, category: 'culture' },
  // Todo board: 606x686 → ~101x114
  'todo-board':        { path: '/sprites/culture/todo-board.png', width: 55, height: 62, category: 'culture' },

  // === EFFECTS (small overlays — keep compact) ===
  'fx-build-failed':   { path: '/sprites/effects/build-failed.png', width: 24, height: 24, category: 'effect' },
  'fx-fire':           { path: '/sprites/effects/fire.png', width: 24, height: 24, category: 'effect' },
  'fx-pr-merge':       { path: '/sprites/effects/github-pr-merge.png', width: 24, height: 24, category: 'effect' },
  'fx-need-coffee':    { path: '/sprites/effects/need-coffee.png', width: 24, height: 24, category: 'effect' },
  'fx-rocket':         { path: '/sprites/effects/rocket.png', width: 24, height: 24, category: 'effect' },
  'fx-sleeping':       { path: '/sprites/effects/sleeping.png', width: 24, height: 24, category: 'effect' },
  'fx-star':           { path: '/sprites/effects/star.png', width: 24, height: 24, category: 'effect' },
  'fx-thumb-up':       { path: '/sprites/effects/thumb-up.png', width: 24, height: 24, category: 'effect' },
  'fx-typing':         { path: '/sprites/effects/typing.png', width: 24, height: 24, category: 'effect' },

  // === ROOMS ===
  'room-office-day':   { path: '/rooms/office-day.png', width: 800, height: 600, category: 'room' },
  'room-office-night': { path: '/rooms/office-night.png', width: 800, height: 600, category: 'room' },
}

// Helper: get asset by key, returns path or fallback
export function getAssetPath(key: string): string | null {
  return ASSETS[key]?.path ?? null
}

// Helper: get all assets by category
export function getAssetsByCategory(category: SpriteAsset['category']): Record<string, SpriteAsset> {
  return Object.fromEntries(
    Object.entries(ASSETS).filter(([, a]) => a.category === category)
  )
}

// Helper: check if an asset exists in the manifest
export function hasAsset(key: string): boolean {
  return key in ASSETS
}
