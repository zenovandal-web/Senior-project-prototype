import React, { useState, useEffect } from 'react'
import './App.css'

// Game State Engine
import {
  createInitialGameState,
  loadGame,
  saveGame,
  clearGameSave,
  movePlayerAction,
  resolveTrapAction,
  searchRoomAction,
  restAction,
  recompileAction,
  hardResetAction,
  debugEnemyAction,
  castSpellAction,
  useHeroSkillAction,
  endTurnAction
} from './game/gameState'

// Components
import GameBoard from './components/GameBoard'
import PlayerDashboard from './components/PlayerDashboard'
import CombatModal from './components/CombatModal'
import TrapModal from './components/TrapModal'
import EventTerminal from './components/EventTerminal'
import RulebookView from './components/RulebookView'

export default function App() {
  const [viewMode, setViewMode] = useState('play') // 'play' | 'rulebook'

  // Initialize or load game state
  const [gameState, setGameState] = useState(() => {
    const saved = loadGame()
    // Validate saved state: if any player has 0 actionsLeft but combat is active,
    // the save is broken — start fresh to avoid a permanently-stuck modal.
    if (saved && saved.players && saved.board) {
      const activeP = saved.players[saved.activePlayerIndex]
      const combatStuck = saved.activeCombat && activeP && activeP.actionsLeft <= 0
      if (!combatStuck) return saved
    }
    return createInitialGameState(['int', 'pointer', 'const', 'recursive'])
  })

  // Auto-save game state changes
  useEffect(() => {
    saveGame(gameState)
  }, [gameState])

  // Deep clone helper — prevents stale nested references causing React to miss updates
  const deepClone = (obj) => JSON.parse(JSON.stringify(obj))

  // Handlers
  const handleTileClick = (targetRow, targetCol) => {
    if (gameState.gameStatus !== 'playing') return
    if (gameState.activeCombat || gameState.activeTrap) return
    const nextState = movePlayerAction(deepClone(gameState), targetRow, targetCol)
    setGameState(nextState)
  }

  const handleResolveTrap = (mode) => {
    const nextState = resolveTrapAction(deepClone(gameState), mode)
    setGameState(nextState)
  }

  const handleSearch = () => {
    const nextState = searchRoomAction(deepClone(gameState))
    setGameState(nextState)
  }

  const handleRest = (choice) => {
    const nextState = restAction(deepClone(gameState), choice)
    setGameState(nextState)
  }

  const handleRecompile = () => {
    const nextState = recompileAction(deepClone(gameState))
    setGameState(nextState)
  }

  const handleHardReset = () => {
    const nextState = hardResetAction(deepClone(gameState))
    setGameState(nextState)
  }

  const handleDebug = (mode) => {
    const nextState = debugEnemyAction(deepClone(gameState), mode)
    setGameState(nextState)
  }

  const handleCastSpell = (spellId) => {
    const nextState = castSpellAction(deepClone(gameState), spellId)
    setGameState(nextState)
  }

  const handleUseSkill = () => {
    const nextState = useHeroSkillAction(deepClone(gameState))
    setGameState(nextState)
  }

  const handleEndTurn = () => {
    const nextState = endTurnAction(deepClone(gameState))
    setGameState(nextState)
  }

  const handleNewGame = () => {
    if (window.confirm('คุณต้องการเริ่มเกมใหม่หรือไม่? ข้อมูลที่บันทึกไว้จะถูกรีเซ็ต')) {
      clearGameSave()
      const freshState = createInitialGameState(['int', 'pointer', 'const', 'recursive'])
      setGameState(freshState)
    }
  }

  const activePlayer = gameState.players[gameState.activePlayerIndex]

  return (
    <div className="app-root-container">
      {/* Top Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <span className="bracket">[</span>C-CODE<span className="bracket">]</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '10px' }}>
            The Compiler's Dungeon
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="nav-links">
          <button
            className={`nav-link ${viewMode === 'play' ? 'active' : ''}`}
            onClick={() => setViewMode('play')}
          >
            🎮 โหมดเล่นเกม (Play Game)
          </button>
          <button
            className={`nav-link ${viewMode === 'rulebook' ? 'active' : ''}`}
            onClick={() => setViewMode('rulebook')}
          >
            📖 คู่มือกฎกติกา (Rulebook)
          </button>
        </div>

        {/* Live Status Indicators */}
        <div className="nav-clock">
          <span className="clock-label">COMPILER CLOCK</span>
          <span className="clock-value">{gameState.compilerClock}</span>
        </div>
      </nav>

      {/* Main Content Area */}
      {viewMode === 'play' ? (
        <main className="play-view-container">
          <div className="gameplay-layout-grid">
            {/* Left: 7x7 Logic Dungeon Board */}
            <div className="layout-col-board">
              <GameBoard
                board={gameState.board}
                players={gameState.players}
                activePlayerIndex={gameState.activePlayerIndex}
                onTileClick={handleTileClick}
              />

              {/* Event / Compiler Log Terminal */}
              <EventTerminal
                logs={gameState.logs}
                compilerClock={gameState.compilerClock}
                bugCount={gameState.bugCount}
                maxBugs={gameState.maxBugsAllowed}
                keys={gameState.permissionKeys}
                keysRequired={gameState.keysRequired}
                onNewGame={handleNewGame}
              />
            </div>

            {/* Right: Player Dashboard & Controls */}
            <div className="layout-col-dashboard">
              <PlayerDashboard
                state={gameState}
                onRest={handleRest}
                onRecompile={handleRecompile}
                onHardReset={handleHardReset}
                onUseSkill={handleUseSkill}
                onCastSpell={handleCastSpell}
                onSearch={handleSearch}
                onEndTurn={handleEndTurn}
              />
            </div>
          </div>

          {/* Active Combat Modal */}
          {gameState.activeCombat && (
            <CombatModal
              activeCombat={gameState.activeCombat}
              player={activePlayer}
              onDebug={handleDebug}
            />
          )}

          {/* Active Trap Modal */}
          {gameState.activeTrap && (
            <TrapModal
              activeTrap={gameState.activeTrap}
              player={activePlayer}
              onResolveTrap={handleResolveTrap}
            />
          )}

          {/* Game Over Modal (Segmentation Fault) */}
          {gameState.gameStatus === 'gameover' && (
            <div className="game-over-overlay">
              <div className="game-over-card lose-card">
                <div className="game-over-icon">💥</div>
                <h2 className="game-over-title">Segmentation Fault (Core Dumped)</h2>
                <p className="game-over-desc">{gameState.gameOverReason}</p>
                <button className="btn btn-primary" onClick={handleNewGame}>
                  🔄 Reboot ระบบ / เริ่มเกมใหม่
                </button>
              </div>
            </div>
          )}

          {/* Victory Modal (Return 0;) */}
          {gameState.gameStatus === 'victory' && (
            <div className="game-over-overlay">
              <div className="game-over-card win-card">
                <div className="game-over-icon">👑</div>
                <h2 className="game-over-title">return 0; // Success!</h2>
                <p className="game-over-desc">{gameState.victoryMessage}</p>
                <button className="btn btn-primary" onClick={handleNewGame}>
                  🏆 เล่นใหม่อีกครั้ง
                </button>
              </div>
            </div>
          )}
        </main>
      ) : (
        <RulebookView onSelectPlayMode={() => setViewMode('play')} />
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">C-Code: The Compiler's Dungeon</div>
          <div className="footer-line">Senior Project · Board Game System &amp; Rulebook</div>
          <div className="footer-code">
            <code>return 0; // All bugs have been compiled into features</code>
          </div>
          <div className="footer-status">
            <span className="status-dot" />
            Backend Status: <span className="green-text">ONLINE &amp; ACTIVE</span>
            &nbsp;|&nbsp; Compiler Clock: <span className="highlight">{gameState.compilerClock}</span>
            &nbsp;|&nbsp; Party: {gameState.players.length} Heroes
          </div>
        </div>
      </footer>
    </div>
  )
}
