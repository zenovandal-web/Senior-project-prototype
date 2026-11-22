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
import OnlineLobbyView from './components/OnlineLobbyView'
import { socket } from './services/socket'

export default function App() {
  const [viewMode, setViewMode] = useState('lobby') // 'lobby' | 'play' | 'rulebook'
  const [multiplayerRoom, setMultiplayerRoom] = useState(null)

  // Initialize or load game state
  const [gameState, setGameState] = useState(() => {
    const saved = loadGame()
    // Validate saved state: if any player has 0 actionsLeft but combat is active,
    // the save is broken — start fresh to avoid a permanently-stuck modal.
    if (saved && saved.players && saved.board) {
      const activeP = saved.players[saved.activePlayerIndex]
      const combatStuck = saved.activeCombat && activeP && activeP.actionsLeft <= 0
      // If previous save had boss at center [3, 3] instead of Boot Sector, reset to new center spawn layout
      const isOldLayout = saved.board[3] && saved.board[3][3] && saved.board[3][3].type === 'boss'
      if (!combatStuck && !isOldLayout) return saved
    }
    return createInitialGameState(['int', 'pointer', 'const', 'recursive'])
  })

  // Auto-save game state changes (Only when playing single player)
  useEffect(() => {
    if (!multiplayerRoom) {
      saveGame(gameState)
    }
  }, [gameState, multiplayerRoom])

  // Real-time Multiplayer Socket Listeners
  useEffect(() => {
    function onGameStarted({ room, gameState: startedState }) {
      setMultiplayerRoom(room)
      setGameState(startedState)
      setViewMode('play')
    }

    function onGameStateSynced(syncedState) {
      setGameState(syncedState)
    }

    function onRoomUpdated(roomData) {
      setMultiplayerRoom(roomData)
      if (roomData && roomData.gameState) {
        setGameState(roomData.gameState)
      }
    }

    socket.on('game_started', onGameStarted)
    socket.on('game_state_synced', onGameStateSynced)
    socket.on('room_updated', onRoomUpdated)

    return () => {
      socket.off('game_started', onGameStarted)
      socket.off('game_state_synced', onGameStateSynced)
      socket.off('room_updated', onRoomUpdated)
    }
  }, [])

  // Deep clone helper — prevents stale nested references causing React to miss updates
  const deepClone = (obj) => JSON.parse(JSON.stringify(obj))

  const activePlayer = gameState.players[gameState.activePlayerIndex]
  const isMyTurn = !multiplayerRoom || (activePlayer?.socketId ? activePlayer.socketId === socket.id : true)

  // Sync state locally and broadcast to other players in multiplayer room
  const updateAndSyncGameState = (nextState) => {
    setGameState(nextState)
    if (multiplayerRoom) {
      socket.emit('sync_game_state', {
        roomCode: multiplayerRoom.code,
        gameState: nextState
      })
    }
  }

  // Handlers
  const handleTileClick = (targetRow, targetCol) => {
    if (multiplayerRoom && !isMyTurn) return
    if (gameState.gameStatus !== 'playing') return
    if (gameState.activeCombat || gameState.activeTrap) return
    const nextState = movePlayerAction(deepClone(gameState), targetRow, targetCol)
    updateAndSyncGameState(nextState)
  }

  const handleResolveTrap = (mode) => {
    if (multiplayerRoom && !isMyTurn) return
    const nextState = resolveTrapAction(deepClone(gameState), mode)
    updateAndSyncGameState(nextState)
  }

  const handleSearch = () => {
    if (multiplayerRoom && !isMyTurn) return
    const nextState = searchRoomAction(deepClone(gameState))
    updateAndSyncGameState(nextState)
  }

  const handleRest = (choice) => {
    if (multiplayerRoom && !isMyTurn) return
    const nextState = restAction(deepClone(gameState), choice)
    updateAndSyncGameState(nextState)
  }

  const handleRecompile = () => {
    if (multiplayerRoom && !isMyTurn) return
    const nextState = recompileAction(deepClone(gameState))
    updateAndSyncGameState(nextState)
  }

  const handleHardReset = () => {
    if (multiplayerRoom && !isMyTurn) return
    const nextState = hardResetAction(deepClone(gameState))
    updateAndSyncGameState(nextState)
  }

  const handleDebug = (mode) => {
    if (multiplayerRoom && !isMyTurn) return
    const nextState = debugEnemyAction(deepClone(gameState), mode)
    updateAndSyncGameState(nextState)
  }

  const handleCastSpell = (spellId) => {
    if (multiplayerRoom && !isMyTurn) return
    const nextState = castSpellAction(deepClone(gameState), spellId)
    updateAndSyncGameState(nextState)
  }

  const handleUseSkill = () => {
    if (multiplayerRoom && !isMyTurn) return
    const nextState = useHeroSkillAction(deepClone(gameState))
    updateAndSyncGameState(nextState)
  }

  const handleEndTurn = () => {
    if (multiplayerRoom && !isMyTurn) return
    const nextState = endTurnAction(deepClone(gameState))
    updateAndSyncGameState(nextState)
  }

  // Host starts multiplayer game from Lobby
  const handleStartMultiplayerGame = (room) => {
    const selectedHeroes = room.players.map(p => p.character || 'int')
    const initial = createInitialGameState(selectedHeroes)

    // Match player names and socket IDs
    initial.players = initial.players.map((p, idx) => {
      const roomP = room.players[idx]
      return {
        ...p,
        name: roomP ? roomP.name : p.name,
        socketId: roomP ? roomP.id : null
      }
    })

    socket.emit('start_game', {
      roomCode: room.code,
      initialGameState: initial
    }, (res) => {
      if (!res?.success) {
        alert(res?.message || 'ไม่สามารถเริ่มเกมได้')
      }
    })
  }

  const handleNewGame = () => {
    if (multiplayerRoom) {
      const isHost = multiplayerRoom.hostId === socket.id
      if (!isHost) {
        alert('เฉพาะ Host เท่านั้นที่สั่งรีสตาร์ทเกมได้')
        return
      }
      if (window.confirm('คุณต้องการรีสตาร์ทเกมออนไลน์รอบนี้หรือไม่?')) {
        const selectedHeroes = multiplayerRoom.players.map(p => p.character || 'int')
        const freshState = createInitialGameState(selectedHeroes)
        freshState.players = freshState.players.map((p, idx) => {
          const roomP = multiplayerRoom.players[idx]
          return {
            ...p,
            name: roomP ? roomP.name : p.name,
            socketId: roomP ? roomP.id : null
          }
        })
        socket.emit('restart_game', {
          roomCode: multiplayerRoom.code,
          newGameState: freshState
        })
        setGameState(freshState)
      }
    } else {
      if (window.confirm('คุณต้องการเริ่มเกมใหม่หรือไม่? ข้อมูลที่บันทึกไว้จะถูกรีเซ็ต')) {
        clearGameSave()
        const freshState = createInitialGameState(['int', 'pointer', 'const', 'recursive'])
        setGameState(freshState)
      }
    }
  }

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
            className={`nav-link ${viewMode === 'lobby' ? 'active' : ''}`}
            onClick={() => setViewMode('lobby')}
          >
            🌐 ห้องออนไลน์ (Online Lobby)
          </button>
          <button
            className={`nav-link ${viewMode === 'play' ? 'active' : ''}`}
            onClick={() => setViewMode('play')}
          >
            🎮 กระดานเกม (Game Board)
          </button>
          <button
            className={`nav-link ${viewMode === 'rulebook' ? 'active' : ''}`}
            onClick={() => setViewMode('rulebook')}
          >
            📖 คู่มือกฎกติกา (Rulebook)
          </button>
        </div>

        {/* Live Status Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {multiplayerRoom && (
            <div style={{
              background: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid #00d4ff',
              color: '#00d4ff',
              padding: '4px 10px',
              borderRadius: 6,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              fontWeight: 700
            }}>
              ROOM: {multiplayerRoom.code}
            </div>
          )}
          <div className="nav-clock">
            <span className="clock-label">COMPILER CLOCK</span>
            <span className="clock-value">{gameState.compilerClock}</span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      {viewMode === 'lobby' ? (
        <OnlineLobbyView
          onStartGame={handleStartMultiplayerGame}
          onBackToSinglePlayer={() => setViewMode('play')}
        />
      ) : viewMode === 'play' ? (
        <main className="play-view-container">
          {/* Multiplayer Live Status Banner */}
          {multiplayerRoom && (
            <div className="multiplayer-status-banner">
              <div className="mp-banner-left">
                <span className="mp-pill">🌐 ห้อง: <strong>{multiplayerRoom.code}</strong></span>
                <span className="mp-pill">👥 ผู้เล่น {multiplayerRoom.players.length} คน</span>
              </div>
              <div className={`mp-banner-center ${isMyTurn ? 'mp-my-turn' : 'mp-waiting'}`}>
                {isMyTurn ? (
                  <span>🟢 <strong>เทิร์นของคุณ ({activePlayer?.name})</strong> — คุณสามารถเดินหรือสั่ง Action ได้</span>
                ) : (
                  <span>⏳ <strong>กำลังรอเทิร์นของ {activePlayer?.name}...</strong></span>
                )}
              </div>
              <div className="mp-banner-right">
                <button
                  className="btn-leave-mp"
                  onClick={() => {
                    if (window.confirm('คุณต้องการออกจากห้องออนไลน์นี้หรือไม่?')) {
                      socket.emit('leave_room')
                      setMultiplayerRoom(null)
                      setViewMode('lobby')
                    }
                  }}
                >
                  🚪 ออกจากห้อง
                </button>
              </div>
            </div>
          )}

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
                isMyTurn={isMyTurn}
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
              isSpectator={Boolean(multiplayerRoom && !isMyTurn)}
            />
          )}

          {/* Active Trap Modal */}
          {gameState.activeTrap && (
            <TrapModal
              activeTrap={gameState.activeTrap}
              player={activePlayer}
              onResolveTrap={handleResolveTrap}
              isSpectator={Boolean(multiplayerRoom && !isMyTurn)}
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
