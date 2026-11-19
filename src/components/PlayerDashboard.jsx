import React from 'react'

export default function PlayerDashboard({
  state,
  onRest,
  onRecompile,
  onHardReset,
  onUseSkill,
  onCastSpell,
  onSearch,
  onEndTurn
}) {
  const player = state.players[state.activePlayerIndex]
  if (!player) return null

  const currentTile = state.board?.[player.position[0]]?.[player.position[1]]
  const isBootSector = currentTile?.type === 'entrance' || (player.position[0] === 3 && player.position[1] === 3)
  const isLootRoom = currentTile?.type === 'loot' && !currentTile?.looted

  return (
    <div className="player-dashboard">
      {/* Top Banner: Turn & Status */}
      <div className="dashboard-header">
        <div className="active-player-badge" style={{ borderColor: player.color }}>
          <span className="player-avatar">{player.avatar}</span>
          <div>
            <div className="player-title">{player.name}</div>
            <div className="player-sub">{player.sub} · Player {player.playerNumber}</div>
          </div>
        </div>

        <div className="action-counter">
          <span className="action-label">ACTIONS เหลือบ</span>
          <div className="action-dots">
            {[1, 2].map(n => (
              <span
                key={n}
                className={`action-dot ${n <= player.actionsLeft ? 'filled' : 'empty'}`}
              >
                ●
              </span>
            ))}
          </div>
        </div>

        <button
          className={`btn btn-end-turn ${player.actionsLeft === 0 ? 'pulse-btn' : ''}`}
          onClick={onEndTurn}
        >
          จบเทิร์น (End Turn) ⏩
        </button>
      </div>

      {/* System Crash Revival Banner */}
      {player.status === 'crashed' && (
        <div className="system-crash-banner">
          <div className="crash-banner-header">
            <span className="crash-icon">🚨</span>
            <div>
              <div className="crash-title">SYSTEM CRASH! (เครื่องดับ)</div>
              <div className="crash-sub">ตัวละคร {player.name} พลังชีวิตหมด / เขียนโค้ดผิดพลาด</div>
            </div>
          </div>
          <p className="crash-guide">
            <strong>ตามกฎการฟื้นคืนชีพ:</strong> ในเทิร์นของคุณ สามารถใช้ทั้ง 2 Actions เพื่อทำ <strong>Hard Reset Reboot</strong> เพื่อฟื้นคืนชีพกลับมาเล่นได้อีกครั้ง
          </p>
          <button className="btn btn-reboot-big" onClick={onHardReset}>
            ⚡ กดใช้การเกิดตามกฎ (Hard Reset Reboot — ฟื้น {Math.floor(player.maxHp / 2)} HP &amp; 2 Focus)
          </button>
        </div>
      )}

      {/* Stats Bar */}
      <div className="dashboard-stats-grid">
        <div className="dash-stat hp-box">
          <div className="dash-stat-label">❤️ HEALTH (HP)</div>
          <div className="dash-stat-val">{player.hp} / {player.maxHp}</div>
          <div className="dash-bar-bg">
            <div
              className="dash-bar-fill hp"
              style={{ width: `${Math.max(0, (player.hp / player.maxHp) * 100)}%` }}
            />
          </div>
        </div>

        <div className="dash-stat focus-box">
          <div className="dash-stat-label">🧠 FOCUS</div>
          <div className="dash-stat-val">{player.focus} / {player.maxFocus}</div>
          <div className="dash-bar-bg">
            <div
              className="dash-bar-fill focus"
              style={{ width: `${Math.max(0, (player.focus / player.maxFocus) * 100)}%` }}
            />
          </div>
        </div>

        <div className="dash-stat def-box">
          <div className="dash-stat-label">🛡️ DEFENSE</div>
          <div className="dash-stat-val">{player.defense}</div>
          <div className="dash-stat-hint">ลดดาเมจจากการโจมตี</div>
        </div>

        <div className="dash-stat status-box">
          <div className="dash-stat-label">⚡ SYSTEM STATUS</div>
          <div className={`status-pill status-${player.status}`}>
            {player.status === 'alive' ? 'ONLINE (ปกติ)' : 'CRASHED (เครื่องดับ)'}
          </div>
        </div>
      </div>

      {/* Action Commands */}
      <div className="dashboard-actions-row">
        {/* Unique Hero Skill */}
        <button
          className="btn btn-skill"
          onClick={onUseSkill}
          disabled={player.focus < player.skillCost || player.status === 'crashed'}
          title={player.skillDesc}
        >
          <span>{player.skillIcon}</span>
          <div>
            <strong>{player.skillName}</strong>
            <span className="cost-tag">{player.skillCost} Focus</span>
          </div>
        </button>

        {/* Search Loot Room */}
        {isLootRoom && (
          <button
            className="btn btn-search"
            onClick={onSearch}
            disabled={player.actionsLeft <= 0 || player.status === 'crashed'}
          >
            🔍 สำรวจกล่องสมบัติ (1 Action)
          </button>
        )}

        {/* Re-compile at Boot Sector */}
        {isBootSector && (
          <button
            className="btn btn-recompile"
            onClick={onRecompile}
            disabled={player.actionsLeft <= 0}
          >
            🔄 Re-compile ฟื้นฟูเต็ม (1 Action)
          </button>
        )}

        {/* Hard Reset if crashed */}
        {player.status === 'crashed' && (
          <button className="btn btn-danger" onClick={onHardReset}>
            ⚡ Hard Reset Reboot (ใช้ 2 Actions)
          </button>
        )}

        {/* Rest */}
        <div className="rest-btn-group">
          <button
            className="btn btn-secondary"
            onClick={() => onRest('hp')}
            disabled={player.actionsLeft <= 0 || player.status === 'crashed' || currentTile.enemy}
          >
            ☕ พักฟื้น +1 HP
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => onRest('focus')}
            disabled={player.actionsLeft <= 0 || player.status === 'crashed' || currentTile.enemy}
          >
            🧠 พักฟื้น +1 Focus
          </button>
        </div>
      </div>

      {/* Inventory: Loot Cards & Spells */}
      <div className="inventory-section">
        {/* Loot Cards */}
        <div className="inventory-col">
          <div className="inv-title">
            <span>📦 ไอเทมสวมใส่ / ในกระเป๋า ({player.inventoryLoot.length})</span>
          </div>
          <div className="card-scroll-row">
            {player.inventoryLoot.length === 0 ? (
              <div className="empty-inv-text">ยังไม่มีไอเทม (ค้นหาได้จากห้องสมบัติ)</div>
            ) : (
              player.inventoryLoot.map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="inv-mini-card">
                  <div className="inv-card-icon">{item.icon}</div>
                  <div className="inv-card-name">{item.name}</div>
                  <div className="inv-card-desc">{item.desc}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Header Spells */}
        <div className="inventory-col">
          <div className="inv-title">
            <span>✨ เฮดเดอร์ไฟล์ / Spells (#include) ({player.inventorySpells.length})</span>
          </div>
          <div className="card-scroll-row">
            {player.inventorySpells.length === 0 ? (
              <div className="empty-inv-text">ไม่มีการ์ดเวทมนตร์</div>
            ) : (
              player.inventorySpells.map((spell, idx) => (
                <div key={`${spell.id}-${idx}`} className="inv-mini-card spell-card">
                  <div className="inv-card-icon">{spell.icon}</div>
                  <div className="inv-card-name"><code>{spell.name}</code></div>
                  <div className="inv-card-cost">{spell.cost} Focus</div>
                  <div className="inv-card-desc">{spell.desc}</div>
                  <button
                    className="btn btn-cast-mini"
                    onClick={() => onCastSpell(spell.id)}
                    disabled={player.focus < spell.cost || player.status === 'crashed'}
                  >
                    ร่าย (#include)
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
