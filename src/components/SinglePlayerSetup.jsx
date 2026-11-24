import React, { useState } from 'react'
import { HEROES_DATA } from '../game/gameData'

export default function SinglePlayerSetup({ onStartGame, hasSavedGame, onContinueSaved }) {
  const [playMode, setPlayMode] = useState('party') // 'solo' | 'party'
  const [selectedSoloHero, setSelectedSoloHero] = useState('int')

  const handleStart = () => {
    if (playMode === 'solo') {
      onStartGame([selectedSoloHero])
    } else {
      onStartGame(['int', 'pointer', 'const', 'recursive'])
    }
  }

  return (
    <div className="online-lobby-container">
      <div className="lobby-header">
        <h1 className="lobby-title">👤 SINGLE PLAYER (โหมดเล่นคนเดียว)</h1>
        <p className="lobby-subtitle">เลือกรูปแบบการผจญภัยใน Compiler Dungeon ของคุณ</p>
      </div>

      {hasSavedGame && (
        <div style={{
          background: 'rgba(0, 212, 255, 0.1)',
          border: '1px solid #00d4ff',
          borderRadius: '10px',
          padding: '16px 20px',
          maxWidth: '700px',
          margin: '0 auto 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <strong style={{ color: '#00d4ff', fontSize: '1rem' }}>💾 พบข้อมูลเกมที่บันทึกไว้</strong>
            <div style={{ fontSize: '0.85rem', color: '#8b9bb4' }}>คุณสามารถเล่นต่อจากจุดเดิมได้ทันที</div>
          </div>
          <button
            className="btn btn-primary"
            onClick={onContinueSaved}
            style={{ padding: '8px 18px', fontSize: '0.9rem' }}
          >
            ▶️ เล่นต่อจากเซฟเดิม
          </button>
        </div>
      )}

      {/* Mode selection tabs */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <button
          className={`btn-lobby ${playMode === 'party' ? 'btn-lobby-primary' : ''}`}
          onClick={() => setPlayMode('party')}
          style={{
            padding: '10px 24px',
            background: playMode === 'party' ? undefined : 'rgba(255,255,255,0.05)',
            border: playMode === 'party' ? 'none' : '1px solid rgba(255,255,255,0.1)',
            color: playMode === 'party' ? undefined : '#8b9bb4'
          }}
        >
          👥 ควบคุมทั้ง 4 ตัวละคร (Full Party)
        </button>

        <button
          className={`btn-lobby ${playMode === 'solo' ? 'btn-lobby-primary' : ''}`}
          onClick={() => setPlayMode('solo')}
          style={{
            padding: '10px 24px',
            background: playMode === 'solo' ? undefined : 'rgba(255,255,255,0.05)',
            border: playMode === 'solo' ? 'none' : '1px solid rgba(255,255,255,0.1)',
            color: playMode === 'solo' ? undefined : '#8b9bb4'
          }}
        >
          🗡️ ลุยเดี่ยวคนเดียว (Solo Hero)
        </button>
      </div>

      {playMode === 'solo' && (
        <div style={{ marginBottom: '24px' }}>
          <h2 className="section-title">🎭 เลือกตัวละครที่คุณต้องการใช้ลุยเดี่ยว:</h2>
          <div className="heroes-grid">
            {Object.values(HEROES_DATA).map((hero) => {
              const isSelected = selectedSoloHero === hero.id
              return (
                <div
                  key={hero.id}
                  className={`hero-card ${isSelected ? 'selected-by-me' : ''}`}
                  onClick={() => setSelectedSoloHero(hero.id)}
                  style={{ borderColor: isSelected ? '#00ff88' : hero.color }}
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

                  {isSelected && (
                    <div className="hero-selected-tag">
                      ✅ เลือกตัวนี้
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {playMode === 'party' && (
        <div style={{
          background: 'rgba(14, 18, 28, 0.7)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '750px',
          margin: '0 auto 28px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#00d4ff', marginBottom: '12px', fontSize: '1.2rem' }}>
            ปาร์ตี้รวม 4 สายอาชีพ (Int, Pointer, Const, Recursive)
          </h3>
          <p style={{ color: '#8b9bb4', fontSize: '0.9rem', lineHeight: '1.6' }}>
            ในโหมดนี้ คุณจะได้ควบคุมตัวละครทั้ง 4 ตัวผลัดกันทำเทิร์นบนกระดานเดียวกัน เหมาะสำหรับการเล่นแบบบอร์ดเกมคลาสสิก วางแผนการแก้บั๊ก และประสานพลังร่วมกัน
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '16px', fontSize: '1.8rem' }}>
            <span title="Int Crusader">⚔️</span>
            <span title="Pointer Assassin">🗡️</span>
            <span title="Const Archmage">🔮</span>
            <span title="Recursive Ranger">🏹</span>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          className="btn-lobby btn-lobby-primary"
          onClick={handleStart}
          style={{ padding: '14px 40px', fontSize: '1.1rem' }}
        >
          🚀 เริ่มเกมเล่นคนเดียว ({playMode === 'solo' ? 'Solo Hero' : 'Full Party'})
        </button>
      </div>
    </div>
  )
}
