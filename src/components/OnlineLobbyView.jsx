import React, { useState, useEffect } from 'react'
import { socket } from '../services/socket'
import { HEROES_DATA } from '../game/gameData'
import './OnlineLobbyView.css'

export default function OnlineLobbyView({ onStartGame, onBackToSinglePlayer }) {
  const [isConnected, setIsConnected] = useState(socket.connected)
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('c_code_player_name') || 'Coder 1')
  
  // Menu Form States
  const [createPassword, setCreatePassword] = useState('')
  const [joinRoomCode, setJoinRoomCode] = useState('')
  const [joinPassword, setJoinPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [copied, setCopied] = useState(false)
  
  // Current Room State
  const [currentRoom, setCurrentRoom] = useState(null)

  // Save Player Name to LocalStorage
  const handleNameChange = (val) => {
    setPlayerName(val)
    localStorage.setItem('c_code_player_name', val)
  }

  // Socket Lifecycle Listeners
  useEffect(() => {
    function onConnect() {
      setIsConnected(true)
      setErrorMsg('')
    }
    function onDisconnect() {
      setIsConnected(false)
    }
    function onRoomUpdated(roomData) {
      setCurrentRoom(roomData)
      if (roomData && roomData.status === 'playing' && onStartGame) {
        onStartGame(roomData)
      }
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('room_updated', onRoomUpdated)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('room_updated', onRoomUpdated)
    }
  }, [onStartGame])

  // Handle Create Room
  const handleCreateRoom = (e) => {
    e.preventDefault()
    setErrorMsg('')
    if (!playerName.trim()) {
      setErrorMsg('กรุณาใส่ชื่อผู้เล่น')
      return
    }

    socket.emit('create_room', { playerName, password: createPassword }, (res) => {
      if (res && res.success) {
        setCurrentRoom(res.room)
      } else {
        setErrorMsg(res?.message || 'ไม่สามารถสร้างห้องได้')
      }
    })
  }

  // Handle Join Room
  const handleJoinRoom = (e) => {
    e.preventDefault()
    setErrorMsg('')
    if (!playerName.trim()) {
      setErrorMsg('กรุณาใส่ชื่อผู้เล่น')
      return
    }
    if (!joinRoomCode.trim()) {
      setErrorMsg('กรุณากรอกรหัสห้อง (Room Code)')
      return
    }

    socket.emit('join_room', {
      roomCode: joinRoomCode,
      password: joinPassword,
      playerName
    }, (res) => {
      if (res && res.success) {
        setCurrentRoom(res.room)
      } else {
        setErrorMsg(res?.message || 'ไม่สามารถเข้าร่วมห้องได้')
      }
    })
  }

  // Handle Select Character
  const handleSelectCharacter = (characterId) => {
    if (!currentRoom) return
    setErrorMsg('')
    const myPlayer = currentRoom.players.find(p => p.id === socket.id)
    
    // หากกดตัวเดิมที่เลือกไว้ ให้ยกเลิกการเลือก
    const newChar = myPlayer?.character === characterId ? null : characterId

    socket.emit('select_character', {
      roomCode: currentRoom.code,
      characterId: newChar
    }, (res) => {
      if (res && !res.success) {
        setErrorMsg(res.message)
      }
    })
  }

  // Handle Toggle Ready
  const handleToggleReady = () => {
    if (!currentRoom) return
    setErrorMsg('')
    socket.emit('toggle_ready', { roomCode: currentRoom.code }, (res) => {
      if (res && !res.success) {
        setErrorMsg(res.message)
      }
    })
  }

  // Handle Leave Room
  const handleLeaveRoom = () => {
    socket.emit('leave_room')
    setCurrentRoom(null)
    setErrorMsg('')
  }

  // Copy Room Code
  const handleCopyCode = () => {
    if (!currentRoom) return
    navigator.clipboard.writeText(currentRoom.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const myPlayer = currentRoom?.players.find(p => p.id === socket.id)
  const isHost = myPlayer?.isHost

  return (
    <div className="online-lobby-container">
      {/* Header */}
      <div className="lobby-header">
        <h1 className="lobby-title">⚔️ ONLINE MULTIPLAYER LOBBY</h1>
        <p className="lobby-subtitle">ระบบห้องออนไลน์และจับคู่ปาร์ตี้ Dungeon Compiler</p>
        
        <div className="connection-pill">
          <span className={`connection-dot ${isConnected ? 'online' : 'offline'}`} />
          <span>{isConnected ? 'Server Online (Port 4000)' : 'กำลังเชื่อมต่อ Server...'}</span>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="error-banner">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* View 1: Main Menu (ไม่ได้อยู่ในห้อง) */}
      {!currentRoom ? (
        <div>
          {/* Global Name Setting */}
          <div style={{ maxWidth: 400, margin: '0 auto 28px' }}>
            <label className="form-label">👤 ชื่อของคุณในเกม (Player Name):</label>
            <input
              type="text"
              className="form-input"
              value={playerName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="ระบุชื่อของคุณ..."
              maxLength={16}
            />
          </div>

          <div className="lobby-menu-grid">
            {/* Create Room Card */}
            <div className="lobby-card">
              <h2 className="lobby-card-title">✨ สร้างห้องใหม่ (Create Room)</h2>
              <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div className="form-group">
                  <label className="form-label">🔒 รหัสผ่านห้อง (Password - ไม่ใส่ก็ได้):</label>
                  <input
                    type="password"
                    className="form-input"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    placeholder="ปล่อยว่างหากต้องการเปิดสาธารณะ"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-lobby btn-lobby-primary"
                  disabled={!isConnected}
                >
                  🚀 สร้างห้องและเป็น Host
                </button>
              </form>
            </div>

            {/* Join Room Card */}
            <div className="lobby-card">
              <h2 className="lobby-card-title">🔑 เข้าร่วมห้อง (Join Room)</h2>
              <form onSubmit={handleJoinRoom} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div className="form-group">
                  <label className="form-label">🏷️ รหัสห้อง (Room Code 4 ตัว):</label>
                  <input
                    type="text"
                    className="form-input room-code-input"
                    value={joinRoomCode}
                    onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                    placeholder="เช่น A7B2"
                    maxLength={4}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">🔒 รหัสผ่านห้อง (หากห้องนั้นตั้งไว้):</label>
                  <input
                    type="password"
                    className="form-input"
                    value={joinPassword}
                    onChange={(e) => setJoinPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่านห้อง..."
                  />
                </div>
                <button
                  type="submit"
                  className="btn-lobby btn-lobby-secondary"
                  disabled={!isConnected}
                >
                  🚪 เข้าร่วมห้อง
                </button>
              </form>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <button
              className="btn btn-secondary"
              onClick={onBackToSinglePlayer}
              style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#8b9bb4', padding: '8px 16px', borderRadius: 6, cursor: 'pointer' }}
            >
              ⬅️ กลับไปเล่นโหมดเครื่องเดียว (Single/Local Hotseat)
            </button>
          </div>
        </div>
      ) : (
        /* View 2: Inside Waiting Lobby (อยู่ในห้องแล้ว) */
        <div>
          {/* Room Status Top Bar */}
          <div className="active-room-bar">
            <div className="room-info-left">
              <span>ห้อง:</span>
              <span className="room-badge">{currentRoom.code}</span>
              <button className="btn-copy" onClick={handleCopyCode}>
                {copied ? '✅ คัดลอกแล้ว!' : '📋 คัดลอกรหัสห้อง'}
              </button>
              {currentRoom.hasPassword && <span title="มีรหัสผ่านป้องกัน">🔒 Private Room</span>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span>👥 ผู้เล่น: {currentRoom.players.length} / 4 คน</span>
              <button className="btn-leave" onClick={handleLeaveRoom}>
                🚪 ออกจากห้อง
              </button>
            </div>
          </div>

          {/* Character Selection */}
          <h2 className="section-title">🎭 เลือกตัวละครของคุณ (Character Selection)</h2>
          <div className="heroes-grid">
            {Object.values(HEROES_DATA).map((hero) => {
              // เช็คว่ามีคนเลือกตัวนี้ไหม
              const takenByPlayer = currentRoom.players.find(p => p.character === hero.id)
              const isSelectedByMe = myPlayer?.character === hero.id
              const isTakenByOther = takenByPlayer && !isSelectedByMe

              return (
                <div
                  key={hero.id}
                  className={`hero-card ${isSelectedByMe ? 'selected-by-me' : ''} ${isTakenByOther ? 'disabled' : ''}`}
                  onClick={() => !isTakenByOther && handleSelectCharacter(hero.id)}
                  style={{
                    borderColor: isSelectedByMe ? '#00ff88' : hero.color
                  }}
                >
                  <div className="hero-card-header">
                    <div className="hero-card-avatar" style={{ border: `1px solid ${hero.color}` }}>
                      {hero.avatar}
                    </div>
                    <div>
                      <div className="hero-card-name" style={{ color: hero.color }}>{hero.name}</div>
                      <div className="hero-card-role">{hero.role}</div>
                    </div>
                  </div>

                  <div className="hero-stats-row">
                    <span className="stat-chip">❤️ HP: {hero.maxHp}</span>
                    <span className="stat-chip">⚡ Focus: {hero.maxFocus}</span>
                    <span className="stat-chip">🛡️ Def: {hero.defense}</span>
                  </div>

                  <div className="hero-skill-preview">
                    <strong>{hero.skillIcon} {hero.skillName}:</strong> {hero.skillDesc}
                  </div>

                  {isSelectedByMe && (
                    <div className="hero-selected-tag">
                      ✅ คุณเลือกตัวละครนี้
                    </div>
                  )}
                  {isTakenByOther && (
                    <div className="hero-taken-tag">
                      🔒 เลือกโดย {takenByPlayer.name}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Players Roster */}
          <div className="players-roster">
            <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#00d4ff' }}>
              📋 รายชื่อปาร์ตี้ในห้อง ({currentRoom.players.length}/4)
            </h3>
            <div className="player-list">
              {currentRoom.players.map((p) => {
                const charData = p.character ? HEROES_DATA[p.character] : null
                const isMe = p.id === socket.id

                return (
                  <div key={p.id} className="player-row">
                    <div className="player-meta">
                      <span style={{ fontSize: '1.2rem' }}>{charData?.avatar || '👤'}</span>
                      <div>
                        <strong>{p.name} {isMe && '(คุณ)'}</strong>
                        {p.isHost && <span className="host-badge" style={{ marginLeft: 8 }}>HOST</span>}
                        <div style={{ fontSize: '0.8rem', color: '#8b9bb4' }}>
                          ตัวละคร: {charData ? <span style={{ color: charData.color }}>{charData.name}</span> : 'ยังไม่ได้เลือก'}
                        </div>
                      </div>
                    </div>

                    <div>
                      {p.isReady ? (
                        <span className="player-status-badge ready">READY ✅</span>
                      ) : (
                        <span className="player-status-badge waiting">WAITING ⏳</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="lobby-actions">
            {!isHost && (
              <button
                className={`btn-lobby ${myPlayer?.isReady ? 'btn-lobby-secondary' : 'btn-lobby-primary'}`}
                onClick={handleToggleReady}
                disabled={!myPlayer?.character}
              >
                {myPlayer?.isReady ? '⏳ ยกเลิกสถานะพร้อม' : '✅ กดพร้อม (Ready)'}
              </button>
            )}

            {isHost && (
              <button
                className="btn-lobby btn-lobby-primary"
                onClick={() => {
                  if (typeof onStartGame === 'function') {
                    onStartGame(currentRoom)
                  }
                }}
                disabled={
                  currentRoom.players.length === 0 ||
                  currentRoom.players.some(p => !p.character || (!p.isHost && !p.isReady))
                }
              >
                🎮 เริ่มเกม (Start Game)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
