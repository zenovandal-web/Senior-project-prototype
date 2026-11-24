// ============================================================================
// C-Code: The Compiler's Dungeon — Game State Engine & Logic
// ============================================================================

import {
  HEROES_DATA,
  GOBLINS_DATA,
  MINIBOSSES_DATA,
  BOSSES_DATA,
  LOOT_CARDS,
  HEADER_SPELLS,
  TRAPS_DATA
} from './gameData'

const STORAGE_KEY = 'c_code_compiler_dungeon_save_v1'

// Helper: Random shuffle
function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Generate the 7x7 board tiles
export function generateBoard() {
  // Total 49 tiles (7x7)
  // Center is [3, 3] = The Boot Sector (Spawn)
  // Remaining 48 tiles:
  // - 17 Logic Gate (normal)
  // - 9 Traps (3 infinite_loop, 3 logic_bomb, 3 voltage_spike)
  // - 7 Loot rooms (4 open_source, 3 cache_memory)
  // - 9 Goblin spawns (5 unstable_code, 4 bug_nest)
  // - 6 Gateway / Mini Boss rooms (Clear 4 to spawn boss portal)
  const pool = []

  for (let i = 0; i < 17; i++) pool.push({ type: 'normal', name: 'Logic Gate', desc: 'ทางเดินปกติ ไม่มี Event พิเศษ' })
  
  for (let i = 0; i < 3; i++) pool.push({ type: 'trap', trapType: 'infinite_loop', name: 'Infinite Loop Pit', desc: 'กับดักความเร็ว (Agility 5+)' })
  for (let i = 0; i < 3; i++) pool.push({ type: 'trap', trapType: 'logic_bomb', name: 'Logic Bomb Step', desc: 'กับดักสติปัญญา (Intellect 6+)' })
  for (let i = 0; i < 3; i++) pool.push({ type: 'trap', trapType: 'voltage_spike', name: 'Voltage Spike', desc: 'กับดักความถึก (Strength 6+)' })

  for (let i = 0; i < 4; i++) pool.push({ type: 'loot', lootType: 'open_source', name: 'Open Source Repository', desc: 'สำรวจเพื่อรับการ์ด Loot 1 ใบ' })
  for (let i = 0; i < 3; i++) pool.push({ type: 'loot', lootType: 'cache_memory', name: 'Cache Memory', desc: 'เร่งความเร็ว จั่ว Header Spell' })

  for (let i = 0; i < 5; i++) pool.push({ type: 'goblin', name: 'Unstable Code Block', desc: 'ห้องที่เต็มไปด้วยบั๊ก' })
  for (let i = 0; i < 4; i++) pool.push({ type: 'goblin', name: 'Bug Nest (Debug Log)', desc: 'รังรวมบั๊ก' })

  for (let i = 0; i < 6; i++) pool.push({ type: 'miniboss', name: 'Gateway to Kernel', desc: 'มินิบอสเฝ้า Permission Key' })

  const shuffledPool = shuffle(pool)
  let poolIdx = 0

  const grid = []
  for (let r = 0; r < 7; r++) {
    const row = []
    for (let c = 0; c < 7; c++) {
      if (r === 3 && c === 3) {
        // Center Boot Sector (Spawn)
        row.push({
          row: r,
          col: c,
          type: 'entrance',
          name: 'The Boot Sector (0x0000)',
          desc: 'จุดเกิดตรงกลางแผนที่ ฟื้นฟู HP/Focus เต็มเมื่อ Re-compile',
          revealed: true,
          visited: true,
          enemy: null,
          looted: false,
        })
      } else {
        const item = shuffledPool[poolIdx++] || { type: 'normal', name: 'Logic Gate', desc: 'ทางเดินปกติ' }
        row.push({
          row: r,
          col: c,
          ...item,
          revealed: false,
          visited: false,
          enemy: null,
          looted: false,
        })
      }
    }
    grid.push(row)
  }

  return grid
}

// Initial game state creator
export function createInitialGameState(selectedHeroIds = ['int', 'pointer']) {
  const players = selectedHeroIds.map((heroId, index) => {
    const base = HEROES_DATA[heroId] || HEROES_DATA.int
    return {
      ...base,
      playerNumber: index + 1,
      hp: base.maxHp,
      focus: base.maxFocus,
      position: [3, 3], // Starts at center Boot Sector [3, 3]
      actionsLeft: 2,
      maxActions: 2,
      status: 'alive', // 'alive', 'crashed', 'stunned'
      inventoryLoot: [LOOT_CARDS[index % LOOT_CARDS.length]], // Start with 1 starter loot
      inventorySpells: [HEADER_SPELLS[index % HEADER_SPELLS.length]], // Start with 1 spell
      equippedWeapon: null,
      equippedArmor: null,
      mathPowerUp: false, // math.h 2x damage buff
      tempFocusLoss: 0,
    }
  })

  const board = generateBoard()
  const randomBoss = BOSSES_DATA[Math.floor(Math.random() * BOSSES_DATA.length)]

  return {
    gameStatus: 'playing', // 'playing', 'victory', 'gameover'
    victoryMessage: '',
    gameOverReason: '',
    round: 1,
    activePlayerIndex: 0,
    currentPhase: 1, // 1: Action, 2: Power, 3: Compiler
    bugCount: 0,
    maxBugsAllowed: 10,
    permissionKeys: 0,
    keysRequired: 4, // Defeat 4 Minibosses to spawn Boss Portal
    bossSpawned: false,
    bossUnlocked: false,
    bossPosition: null,
    bossActive: false,
    currentBoss: JSON.parse(JSON.stringify(randomBoss)),
    players,
    board,
    lootDeck: shuffle([...LOOT_CARDS]),
    spellDeck: shuffle([...HEADER_SPELLS]),
    goblinDeck: shuffle([...GOBLINS_DATA]),
    minibossDeck: shuffle([...MINIBOSSES_DATA]),
    activeCombat: null, // { enemy, type: 'goblin'|'miniboss'|'boss', playerIndex }
    activeTrap: null,   // { trapData, playerIndex }
    logs: [
      `[INIT] C-Code: The Compiler's Dungeon เริ่มการทำงาน...`,
      `[SETUP] ผู้เล่นทุกคน Spawn ที่จุดเกิดใจกลางแผนที่ The Boot Sector [3, 3]`,
      `[MISSION] ปราบ Mini Boss ให้ครบ 4 ตัว เพื่อเปิดประตูสู่ห้อง Boss ใหญ่แบบสุ่ม!`,
    ],
  }
}


// Save & Load
export function saveGame(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save game state', e)
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to load game state', e)
  }
  return null
}

export function clearGameSave() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.error('Failed to clear game save', e)
  }
}

// Append log helper
export function addLog(state, message) {
  const time = new Date().toLocaleTimeString('th-TH', { hour12: false })
  state.logs.unshift(`[${time}] ${message}`)
  if (state.logs.length > 50) state.logs.pop()
}

// Move Player Logic
export function movePlayerAction(state, targetRow, targetCol) {
  const player = state.players[state.activePlayerIndex]
  if (player.status === 'crashed') {
    addLog(state, `⚠️ ${player.name} อยู่ในสถานะ System Crash ไม่สามารถเดินได้! ต้องกู้คืนระบบก่อน`)
    return state
  }
  if (player.actionsLeft <= 0) {
    addLog(state, `⚠️ ${player.name} ไม่มี Action เหลือในเทิร์นนี้!`)
    return state
  }

  const [curR, curC] = player.position
  const dRow = Math.abs(curR - targetRow)
  const dCol = Math.abs(curC - targetCol)

  // Move 1 step around oneself (adjacent: up, down, left, right, or diagonal)
  if (dRow > 1 || dCol > 1 || (dRow === 0 && dCol === 0)) {
    addLog(state, `⚠️ สามารถเดินได้ทีละ 1 ช่องรอบตัวเท่านั้น`)
    return state
  }

  // Deduct 1 action per 1-tile step
  player.actionsLeft -= 1
  player.position = [targetRow, targetCol]

  const tile = state.board[targetRow][targetCol]
  const wasRevealed = tile.revealed
  tile.revealed = true
  tile.visited = true

  // If tile was already revealed and is NOT the boss room, walk freely without event
  if (wasRevealed && tile.type !== 'boss') {
    addLog(state, `🏃 ${player.name} ก้าวไปยัง [${targetRow}, ${targetCol}] - ${tile.name} (เหลือ ${player.actionsLeft} Action)`)
    saveGame(state)
    return { ...state }
  }

  addLog(state, `🏃 ${player.name} สำรวจช่องใหม่ [${targetRow}, ${targetCol}] - ${tile.name} (เหลือ ${player.actionsLeft} Action)`)

  // First time entering this tile — Check tile events
  if (tile.type === 'trap') {
    const trap = TRAPS_DATA[tile.trapType]
    state.activeTrap = { trap, playerIndex: state.activePlayerIndex }
    addLog(state, `🚨 เจอกับดัก! ${trap.name} ต้องทำการตรวจสอบค่าพลัง ${trap.stat} (แต้มเป้าหมาย: ${trap.threshold}+)`)
  } else if (tile.type === 'goblin' && !tile.enemy && !tile.looted) {
    // Spawn goblin if not exists
    const goblin = state.goblinDeck.pop() || GOBLINS_DATA[0]
    tile.enemy = JSON.parse(JSON.stringify(goblin))
    state.bugCount += 1
    state.activeCombat = { enemy: tile.enemy, type: 'goblin', playerIndex: state.activePlayerIndex }
    addLog(state, `🐛 พบ Bug ศัตรู! ${goblin.name} (${goblin.type}) โค้ดที่พัง: ${goblin.code}`)
  } else if (tile.type === 'miniboss' && !tile.enemy && !tile.looted) {
    // Spawn mini boss
    const miniboss = state.minibossDeck.pop() || MINIBOSSES_DATA[0]
    tile.enemy = JSON.parse(JSON.stringify(miniboss))
    state.activeCombat = { enemy: tile.enemy, type: 'miniboss', playerIndex: state.activePlayerIndex }
    addLog(state, `⚔️ เผชิญหน้ามินิบอส Runtime Warden! ${miniboss.name} ป้องกันทางผ่านสู่ Kernel!`)
  } else if (tile.type === 'boss') {
    state.bossActive = true
    state.activeCombat = { enemy: state.currentBoss, type: 'boss', playerIndex: state.activePlayerIndex }
    addLog(state, `💥 เข้าสู่ห้องบอสใหญ่! ${state.currentBoss.name} ปรากฏตัว! Overclock ทำงาน: Compiler Clock จะลดเร็วขึ้น!`)
  }

  saveGame(state)
  return { ...state }
}

// Resolve Trap
// choice: 'code_correct' | 'code_wrong' | 'code_fatal'
export function resolveTrapAction(state, choice = 'code_correct') {
  if (!state.activeTrap) return state
  const { trap, playerIndex } = state.activeTrap
  const player = state.players[playerIndex]

  if (choice === 'code_correct') {
    addLog(state, `✅ ${player.name} แก้ไขโค้ดได้สำเร็จ! หลุดออกจากกับดัก ${trap.name} โดยไม่เสียอะไร!`)
    state.activeTrap = null
  } else if (choice === 'code_fatal') {
    player.hp = 0
    handleSystemCrash(state, player)
    addLog(state, `💀 ${player.name} แก้กับดักผิดครบ 3 ครั้ง! เกิด System Crash ตัวละครดับลง`)
    state.activeTrap = null

    if (state.gameStatus !== 'gameover') {
      endTurnAction(state)
    }
  } else {
    // code_wrong (< 3 attempts)
    addLog(state, `⚠️ ${player.name} แก้ไขกับดักผิดพลาด (Compile Error)! พยายามใหม่อีกครั้ง`)
  }

  saveGame(state)
  return { ...state }
}

// System Crash handler
function handleSystemCrash(state, player) {
  player.status = 'crashed'
  addLog(state, `🚨 SYSTEM CRASH! HP ของ ${player.name} เหลือ 0! ตัวละครล้มลงในห้อง`)
  
  // Data Loss: Discard 1 Loot or Spell
  if (player.inventoryLoot.length > 0) {
    const lost = player.inventoryLoot.pop()
    addLog(state, `💥 Data Loss: สูญเสียไอเทม ${lost.name} เนื่องจากเครื่องดับ`)
  } else if (player.inventorySpells.length > 0) {
    const lost = player.inventorySpells.pop()
    addLog(state, `💥 Data Loss: สูญเสียเวทมนตร์ ${lost.name}`)
  }

  // Check game over
  const allCrashed = state.players.every(p => p.status === 'crashed')
  if (allCrashed) {
    state.gameStatus = 'gameover'
    state.gameOverReason = 'System Crash! ผู้เล่นทุกคน HP หมดสิ้น'
    addLog(state, `💀 GAME OVER: System Crash! ระบบล่มถาวร`)
  }
}

// Search Room (Loot)
export function searchRoomAction(state) {
  const player = state.players[state.activePlayerIndex]
  const [r, c] = player.position
  const tile = state.board[r][c]

  if (tile.type !== 'loot') {
    addLog(state, `⚠️ ห้องนี้ไม่ใช่ห้องสมบัติ ไม่สามารถค้นหาได้`)
    return state
  }
  if (tile.looted) {
    addLog(state, `⚠️ ห้องนี้ถูกสำรวจไปแล้ว`)
    return state
  }
  if (player.actionsLeft <= 0) {
    addLog(state, `⚠️ ไม่มี Action เหลือ`)
    return state
  }

  player.actionsLeft -= 1
  tile.looted = true

  if (tile.lootType === 'cache_memory') {
    // Draw 2 spells, keep 1
    const s1 = state.spellDeck.pop() || HEADER_SPELLS[0]
    player.inventorySpells.push(s1)
    addLog(state, `✨ ${player.name} สำรวจ Cache Memory ได้รับการ์ดสเปล ${s1.name}`)
  } else {
    // Open source repo: draw loot card
    const card = state.lootDeck.pop() || LOOT_CARDS[0]
    player.inventoryLoot.push(card)
    addLog(state, `🎁 ${player.name} สำรวจ Open Source Repository ได้รับไอเทม [${card.name}]! (${card.desc})`)
  }

  saveGame(state)
  return { ...state }
}

// Rest Action
export function restAction(state, choice = 'hp') {
  const player = state.players[state.activePlayerIndex]
  if (player.actionsLeft <= 0) {
    addLog(state, `⚠️ ไม่มี Action เหลือ`)
    return state
  }

  const [r, c] = player.position
  const tile = state.board[r][c]
  if (tile.enemy) {
    addLog(state, `⚠️ มีศัตรูอยู่ในห้อง ไม่สามารถพักผ่อนได้!`)
    return state
  }

  player.actionsLeft -= 1
  if (choice === 'hp') {
    player.hp = Math.min(player.maxHp, player.hp + 1)
    addLog(state, `☕ ${player.name} พักผ่อน ฟื้นฟู +1 HP (ปัจจุบัน: ${player.hp}/${player.maxHp})`)
  } else {
    player.focus = Math.min(player.maxFocus, player.focus + 1)
    addLog(state, `🧠 ${player.name} พักผ่อน ฟื้นฟู +1 Focus (ปัจจุบัน: ${player.focus}/${player.maxFocus})`)
  }

  saveGame(state)
  return { ...state }
}

// Re-compile at Boot Sector
export function recompileAction(state) {
  const player = state.players[state.activePlayerIndex]
  const [r, c] = player.position
  const currentTile = state.board[r][c]
  if (currentTile.type !== 'entrance' && (r !== 3 || c !== 3)) {
    addLog(state, `⚠️ ต้องอยู่ที่ The Boot Sector [3, 3] เท่านั้นเพื่อ Re-compile`)
    return state
  }
  if (player.actionsLeft <= 0) {
    addLog(state, `⚠️ ไม่มี Action เหลือ`)
    return state
  }

  player.actionsLeft -= 1
  player.hp = player.maxHp
  player.focus = player.maxFocus
  if (player.status === 'crashed') player.status = 'alive'

  addLog(state, `🔄 Re-compile สำเร็จ! ${player.name} ฟื้นฟู HP และ Focus เต็มจำนวน!`)
  saveGame(state)
  return { ...state }
}

// Hard Reset Recovery
export function hardResetAction(state) {
  const player = state.players[state.activePlayerIndex]
  if (player.status !== 'crashed') {
    addLog(state, `⚠️ ตัวละครไม่ได้อยู่ในสถานะ System Crash`)
    return state
  }

  player.actionsLeft = 0
  player.status = 'alive'
  player.hp = Math.floor(player.maxHp / 2)
  player.focus = Math.min(player.maxFocus, 2)

  addLog(state, `🔄 ${player.name} ทำ Hard Reset Reboot ฟื้นคืนชีพตามกฎสำเร็จ! (ฟื้น HP เป็น ${player.hp}/${player.maxHp} และ Focus 2 หน่วย) — สิ้นสุดการ Reboot ในเทิร์นนี้`)
  saveGame(state)
  return { ...state }
}

// Debug / Attack Combat
// mode: 'code_correct' | 'code_wrong' | 'code_fatal'
export function debugEnemyAction(state, mode = 'code_correct') {
  if (!state.activeCombat) return state
  const { enemy, type } = state.activeCombat
  const player = state.players[state.activePlayerIndex]

  if (mode === 'code_correct') {
    // Player typed the correct code — defeat enemy, no Focus cost
    const isExpert = Array.isArray(enemy.expertHero)
      ? enemy.expertHero.includes(player.id)
      : enemy.expertHero === player.id

    addLog(state, `✅ ${player.name} แก้ไขโค้ดได้สำเร็จ${isExpert ? ' (Expert สายตรง!)' : ''}! กำจัด ${enemy.name} สำเร็จ!`)
    defeatEnemy(state, enemy, type)

  } else if (mode === 'code_fatal') {
    // Player failed 3 times — Fatal System Crash
    player.hp = 0
    handleSystemCrash(state, player)
    addLog(state, `💀 ${player.name} พิมพ์โค้ดผิดครบ 3 ครั้ง! เกิด System Crash ตัวละครดับลงและหลุดจากการต่อสู้`)
    state.activeCombat = null

    if (state.gameStatus !== 'gameover') {
      endTurnAction(state)
    }

  } else if (mode === 'code_wrong') {
    // Player typed wrong code (< 3 attempts) — apply warning & minor penalty
    const penaltyDmg = enemy.penaltyDmg || 1
    player.hp = Math.max(0, player.hp - penaltyDmg)
    addLog(state, `❌ ${player.name} พิมพ์โค้ดผิด! Compile Error! โดนดาเมจสะท้อน ${penaltyDmg} HP (เหลือ ${player.hp}/${player.maxHp})`)

    if (player.hp === 0) {
      handleSystemCrash(state, player)
      state.activeCombat = null
      if (state.gameStatus !== 'gameover') {
        endTurnAction(state)
      }
    }
  }

  saveGame(state)
  return { ...state }
}

// Defeat Enemy
function defeatEnemy(state, enemy, type) {
  const [r, c] = state.players[state.activePlayerIndex].position
  const tile = state.board[r][c]
  tile.enemy = null
  state.activeCombat = null

  if (type === 'goblin') {
    state.bugCount = Math.max(0, state.bugCount - 1)
    addLog(state, `🎉 กำจัดบั๊ก ${enemy.name} สำเร็จ! โค้ดที่แก้: "${enemy.solution}"`)
  } else if (type === 'miniboss') {
    state.permissionKeys += 1
    addLog(state, `🏆 พิชิต Mini Boss ${enemy.name}! ได้รับ Permission Key 🔑 (${state.permissionKeys}/${state.keysRequired})`)

    // When 4 Minibosses are cleared, randomly spawn the boss room on the map!
    if (state.permissionKeys >= state.keysRequired && !state.bossSpawned) {
      state.bossSpawned = true
      state.bossUnlocked = true

      // Find valid candidate tiles
      const candidates = []
      for (let cr = 0; cr < 7; cr++) {
        for (let cc = 0; cc < 7; cc++) {
          if (cr === 3 && cc === 3) continue // Not spawn
          const hasPlayer = state.players.some(p => p.position[0] === cr && p.position[1] === cc)
          if (hasPlayer) continue
          const t = state.board[cr][cc]
          if (t.type !== 'entrance') {
            candidates.push({ r: cr, c: cc })
          }
        }
      }

      const pick = candidates[Math.floor(Math.random() * candidates.length)]
      if (pick) {
        state.bossPosition = [pick.r, pick.c]
        const bossTile = state.board[pick.r][pick.c]
        bossTile.type = 'boss'
        bossTile.name = `The CPU Core — ${state.currentBoss.name}`
        bossTile.desc = `ห้องบอสใหญ่ ${state.currentBoss.name}! เข้าไปเพื่อเริ่มการต่อสู้ Final Boss`
        bossTile.revealed = true
        bossTile.enemy = JSON.parse(JSON.stringify(state.currentBoss))

        addLog(state, `🎉 ปราบ Mini Boss ครบ 4 ตัวแล้ว! ได้รับ Key ครบ 4 ดอก!`)
        addLog(state, `🌀 [PORTAL OPEN] ประตูห้องบอสใหญ่ (CPU Core) สุ่มปรากฏขึ้นแล้วที่พิกัด [${pick.r}, ${pick.c}]!`)
        addLog(state, `👑 เคลื่อนที่ไปยังพิกัด [${pick.r}, ${pick.c}] เพื่อเริ่มศึกตัดสินกับ ${state.currentBoss.name}!`)
      }
    }
  } else if (type === 'boss') {
    state.gameStatus = 'victory'
    state.victoryMessage = `🎉 Return 0; ชัยชนะ! กำจัด ${enemy.name} และ Debug ดันเจี้ยนสำเร็จโดยสมบูรณ์!`
    addLog(state, `👑 VICTORY! Boss ถูกกำจัดและแก้โค้ดครบทุกจุด! โปรแกรม Complied Successfully with 0 Errors!`)
  }
}

// Cast Header Spell
export function castSpellAction(state, spellId) {
  const player = state.players[state.activePlayerIndex]
  const spellIndex = player.inventorySpells.findIndex(s => s.id === spellId)
  if (spellIndex === -1) return state

  const spell = player.inventorySpells[spellIndex]
  if (player.focus < spell.cost) {
    addLog(state, `⚠️ Focus ไม่พอสำหรับการร่าย ${spell.name} (ต้องการ ${spell.cost} Focus)`)
    return state
  }

  player.focus -= spell.cost

  if (spell.id === 'spell_2') { // stdlib.h (Heal / Patch)
    player.hp = Math.min(player.maxHp, player.hp + 2)
    addLog(state, `💊 ร่าย ${spell.name}: ฟื้นฟู 2 HP ให้กับ ${player.name}`)
  } else if (spell.id === 'spell_3') { // math.h (Power Up 2x dmg)
    player.mathPowerUp = true
    addLog(state, `💥 ร่าย ${spell.name}: เพิ่มพลังโจมตี 2 เท่าในการโจมตีครั้งถัดไป!`)
  } else if (spell.id === 'spell_5') { // time.h (Extra Actions)
    player.actionsLeft += 2
    addLog(state, `⏸️ ร่าย ${spell.name}: ย้อนเวลาการประมวลผล ได้รับเพิ่ม +2 Actions ทันที!`)
  } else if (spell.id === 'spell_8') { // assert.h (Force quit goblin)
    const [r, c] = player.position
    const tile = state.board[r][c]
    if (tile.enemy && tile.type === 'goblin') {
      addLog(state, `💣 ร่าย ${spell.name}: ทำลายล้างบั๊ก ${tile.enemy.name} ทันที!`)
      defeatEnemy(state, tile.enemy, 'goblin')
    } else {
      addLog(state, `💣 ร่าย ${spell.name}: บังคับปิดกระบวนการทำงาน`)
    }
  } else if (spell.id === 'spell_9') { // limits.h (+2 Max Focus)
    player.maxFocus += 2
    player.focus += 2
    addLog(state, `📈 ร่าย ${spell.name}: ขยายเพดานพลังงาน Max Focus +2 ถาวร!`)
  } else {
    addLog(state, `✨ ร่าย ${spell.name}: ใช้งานความสามารถ ${spell.title} สำเร็จ`)
  }

  // Remove spell after cast
  player.inventorySpells.splice(spellIndex, 1)

  saveGame(state)
  return { ...state }
}

// Use Hero Unique Skill
export function useHeroSkillAction(state) {
  const player = state.players[state.activePlayerIndex]
  if (player.focus < player.skillCost) {
    addLog(state, `⚠️ Focus ไม่พอสำหรับการใช้สกิล ${player.skillName} (ต้องการ ${player.skillCost} Focus)`)
    return state
  }

  player.focus -= player.skillCost

  if (player.id === 'int') {
    // Buffer Overflow
    addLog(state, `🔥 Int Crusader ปลดปล่อยสกิล [Buffer Overflow]! ระเบิดบัฟเฟอร์ทำ 2 DMG ใส่ศัตรูในห้อง!`)
    const [r, c] = player.position
    const tile = state.board[r][c]
    if (tile.enemy) {
      defeatEnemy(state, tile.enemy, tile.type)
    }
  } else if (player.id === 'pointer') {
    // Direct Reference
    addLog(state, `⚡ Pointer Assassin ปลดปล่อยสกิล [Direct Reference]! ชี้ Address ไปยังห้องข้างเคียง`)
  } else if (player.id === 'const') {
    // Constant Definition
    addLog(state, `🔒 Const Archmage ใช้สกิล [Constant Definition]! เสริมความเสถียรป้องกันระบบ`)
  } else if (player.id === 'recursive') {
    // Function Call
    player.actionsLeft += 1
    addLog(state, `🔁 Recursive Ranger ใช้สกิล [Function Call]! ได้รับ +1 Action ทันทีเพื่อทำซ้ำ!`)
  }

  saveGame(state)
  return { ...state }
}

// End Turn & Compiler / Enemy Phase
export function endTurnAction(state) {
  const prevPlayer = state.players[state.activePlayerIndex]
  addLog(state, `🏁 ${prevPlayer.name} จบเทิร์น`)

  // Check if round finishes
  const nextIdx = (state.activePlayerIndex + 1) % state.players.length
  state.activePlayerIndex = nextIdx

  if (nextIdx === 0) {
    // End of full round
    state.round += 1
    addLog(state, `🔄 สิ้นสุดรอบที่ ${state.round - 1}! กำลังเริ่มต้นรอบที่ ${state.round}`)

    // Spawn Bug event every 2 rounds
    if (state.round % 2 === 0) {
      state.bugCount += 1
      addLog(state, `🐛 [System Alert] บั๊กตัวใหม่ Spawn ลงบนแผนที่! (บั๊กทั้งหมด: ${state.bugCount}/${state.maxBugsAllowed})`)
      if (state.bugCount > state.maxBugsAllowed) {
        state.gameStatus = 'gameover'
        state.gameOverReason = 'Stack Overflow! บั๊กและก๊อบลินล้นระบบเกินขีดจำกัด'
        addLog(state, `💀 GAME OVER: Stack Overflow! บั๊กล้นกระดาน`)
        saveGame(state)
        return { ...state }
      }
    }
  }

  // Reset next player actions
  const nextPlayer = state.players[state.activePlayerIndex]
  if (nextPlayer.status === 'alive') {
    nextPlayer.actionsLeft = 2
    addLog(state, `▶ เทิร์นของ ${nextPlayer.name} (HP: ${nextPlayer.hp}/${nextPlayer.maxHp}, Focus: ${nextPlayer.focus}/${nextPlayer.maxFocus}, Actions: 2)`)
  } else {
    nextPlayer.actionsLeft = 0
    addLog(state, `⚠️ เทิร์นของ ${nextPlayer.name} (System Crash) สามารถเลือกทำ Hard Reset ได้`)
  }

  saveGame(state)
  return { ...state }
}
