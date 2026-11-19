// ============================================================================
// C-Code: The Compiler's Dungeon — Smart Code Validator
// ============================================================================

// Clean string for fuzzy comparison: remove comments, all whitespace, lowercase
export function cleanCode(str = '') {
  return str
    .replace(/\/\/[^\n]*/g, '')         // remove single line comments
    .replace(/\/\*[\s\S]*?\*\//g, '')    // remove multi-line comments
    .replace(/\s+/g, '')                // remove all whitespace
    .replace(/["']/g, '"')              // normalize quotes
    .toLowerCase()
}

// Enemy-specific validation rules
const ENEMY_RULES = {
  // Goblins
  goblin_1: (user) => user.includes(';') && (user.includes('printf') || user.length < 5),
  goblin_2: (user) => user.includes('break'),
  goblin_3: (user) => user.includes('=='),
  goblin_4: (user) => user.includes('malloc') || user.includes('&'),
  goblin_5: (user) => user.includes('arr[0]') || user.includes('arr[1]') || user.includes('arr[2]') || (user.includes('arr[') && !user.includes('arr[3]')),
  goblin_6: (user) => user.includes('free'),
  goblin_7: (user) => user.includes('*/'),
  goblin_8: (user) => user.includes('float') || user.includes('5.0') || user.includes('5.0f') || user.includes('2.0'),
  goblin_9: (user) => user.includes('return') && (user.includes('0') || user.includes('1') || user.includes('true') || user.includes('false')),
  goblin_10: (user) => user.includes('&input') || user.includes('&'),

  // Mini Bosses
  mb_1: (user) => user.includes('if') || user.includes('n-1') || user.includes('n - 1') || user.includes('return 0'),
  mb_2: (user) => user.includes('null') || user.includes('p=null') || user.includes('p = null') || user.includes('p=0'),
  mb_3: (user) => user.includes('funcptr') || user.includes('myfunc') || user.includes('(*funcptr)'),
  mb_4: (user) => (user.includes('(x)*(x)') || user.includes('((x)*(x))') || user.includes('(x) * (x)') || user.includes('((x) * (x))')),
  mb_5: (user) => user.includes('struct') && user.includes('double') && user.includes('char'),
  mb_6: (user) => user.includes('realloc'),
  mb_7: (user) => user.includes('mutex') || user.includes('lock') || user.includes('pthread'),
  mb_8: (user) => user.includes('\\0') || user.includes('0') || user.includes('name[4]'),

  // Bosses
  boss_1: (user) => user.includes('malloc'),
  boss_2: (user) => user.includes('mutex') || user.includes('lock') || user.includes('unlock'),
  boss_3: (user) => user.includes('free'),
  boss_4: (user) => user.includes('n-1') || user.includes('n - 1') || (user.includes('if') && user.includes('return')),
  boss_5: (user) => user.includes('fgets') || user.includes('\\0') || user.includes('sizeof'),
  boss_6: (user) => user.includes('kill.h') || user.includes('voidkill') || user.includes('void kill') || user.includes('include'),
}

// Trap-specific validation rules
const TRAP_RULES = {
  infinite_loop: (user) => user.includes('break'),
  logic_bomb: (user) => user.includes('=='),
  voltage_spike: (user) => user.includes('if') && (user.includes('volt') || user.includes('max_volt') || user.includes('runsystem')),
}

/**
 * Validate user code against an enemy challenge
 */
export function validateEnemyCode(enemy, userCode) {
  if (!userCode || !userCode.trim()) return false

  const userClean = cleanCode(userCode)
  const solClean = cleanCode(enemy.solution || '')

  // 1. Direct match with solution (e.g. copied from hint or exact match)
  if (userClean === solClean) return true
  if (userClean.includes(solClean) || (solClean.length > 5 && solClean.includes(userClean))) return true

  // 2. Specific rule check
  const rule = ENEMY_RULES[enemy.id]
  if (rule) {
    const rawLower = userCode.toLowerCase()
    if (rule(userClean) || rule(rawLower)) return true
  }

  // 3. Fallback: check if user contains at least 70% of solution alphanumeric tokens
  const solTokens = (enemy.solution || '')
    .toLowerCase()
    .split(/[^a-z0-9_]+/)
    .filter(t => t.length > 2)

  if (solTokens.length > 0) {
    const matched = solTokens.filter(t => userClean.includes(t))
    if (matched.length / solTokens.length >= 0.7) return true
  }

  return false
}

/**
 * Validate user code against a trap challenge
 */
export function validateTrapCode(trapId, userCode, solution = '') {
  if (!userCode || !userCode.trim()) return false

  const userClean = cleanCode(userCode)
  const solClean = cleanCode(solution)

  // 1. Direct match with solution
  if (userClean === solClean) return true
  if (userClean.includes(solClean) || (solClean.length > 5 && solClean.includes(userClean))) return true

  // 2. Trap specific rule
  const rule = TRAP_RULES[trapId]
  if (rule) {
    const rawLower = userCode.toLowerCase()
    if (rule(userClean) || rule(rawLower)) return true
  }

  return false
}
