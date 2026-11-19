import React from 'react'

export default function GameBoard({ board, players, activePlayerIndex, onTileClick }) {
  const activePlayer = players[activePlayerIndex]
  const [curR, curC] = activePlayer ? activePlayer.position : [6, 6]

  const getTileIcon = (tile) => {
    if (!tile.revealed) return '❓'
    if (tile.type === 'entrance') return '🏠'
    if (tile.type === 'boss') return '👑'
    if (tile.type === 'miniboss') return tile.enemy ? '⚔️' : '🟣'
    if (tile.type === 'goblin') return tile.enemy ? '🐛' : '🕸️'
    if (tile.type === 'loot') return tile.looted ? '📭' : '🎁'
    if (tile.type === 'trap') return '⚠️'
    return '🚪'
  }

  const getTileClass = (tile) => {
    const classes = ['game-tile']
    if (!tile.revealed) classes.push('tile-hidden')
    else classes.push(`tile-${tile.type}`)

    // Check if within move range (dist <= 2)
    const dist = Math.abs(tile.row - curR) + Math.abs(tile.col - curC)
    if (dist > 0 && dist <= 2 && activePlayer?.actionsLeft > 0) {
      classes.push('tile-reachable')
    }

    if (tile.row === curR && tile.col === curC) {
      classes.push('tile-current-player')
    }

    return classes.join(' ')
  }

  return (
    <div className="game-board-container">
      <div className="board-header">
        <div className="board-title">
          <span className="code-tag">&lt;LogicBoard_7x7 /&gt;</span>
          <span className="board-subtitle">คลิกช่องที่มีกรอบเขียวเพื่อเดิน (ใช้ 1 Action)</span>
        </div>
        <div className="board-coords">
          ตำแหน่งปัจจุบัน: <code>[{curR}, {curC}]</code>
        </div>
      </div>

      <div className="grid-7x7">
        {board.map((row, r) => (
          <div key={`row-${r}`} className="grid-row">
            {row.map((tile, c) => {
              const playersOnTile = players.filter(p => p.position[0] === r && p.position[1] === c)
              const isCurrent = r === curR && c === curC

              return (
                <div
                  key={`tile-${r}-${c}`}
                  className={getTileClass(tile)}
                  onClick={() => onTileClick(r, c)}
                  title={`${tile.name} [${r}, ${c}]`}
                >
                  <div className="tile-bg-overlay" />
                  
                  {/* Tile Icon / Status */}
                  <div className="tile-center-icon">
                    {getTileIcon(tile)}
                  </div>

                  {/* Tile Name / Coords */}
                  <div className="tile-coords">{r},{c}</div>

                  {/* Players on Tile */}
                  {playersOnTile.length > 0 && (
                    <div className="tile-players">
                      {playersOnTile.map(p => (
                        <span
                          key={p.id}
                          className={`player-token ${p.id === activePlayer?.id ? 'active-token' : ''}`}
                          style={{ borderColor: p.color }}
                          title={`${p.name} (P${p.playerNumber})`}
                        >
                          {p.avatar}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Active Bug Badge */}
                  {tile.enemy && tile.revealed && (
                    <div className="tile-enemy-badge">
                      {tile.enemy.hp ? `HP:${tile.enemy.hp}` : '!'}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
