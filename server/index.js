import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

const PORT = process.env.PORT || 4000

// In-Memory store: Map<roomCode, RoomObject>
const rooms = new Map()

// Helper: สุ่มรหัสห้อง 4 ตัวอักษร
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return rooms.has(code) ? generateRoomCode() : code
}

// Helper: แปลงข้อมูลห้องให้ปลอดภัยก่อนส่งให้ Client
function serializeRoom(room) {
  if (!room) return null
  return {
    code: room.code,
    hasPassword: Boolean(room.password),
    hostId: room.hostId,
    status: room.status,
    players: room.players.map(p => ({
      id: p.id,
      name: p.name,
      character: p.character,
      isHost: p.id === room.hostId,
      isReady: p.isReady
    })),
    gameState: room.gameState
  }
}

// API Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    activeRooms: rooms.size,
    rooms: Array.from(rooms.keys())
  })
})

// WebSocket Events
io.on('connection', (socket) => {
  console.log(`[Connected] Socket ID: ${socket.id}`)

  // 1. สร้างห้องใหม่
  socket.on('create_room', ({ playerName, password }, callback) => {
    try {
      const roomCode = generateRoomCode()
      const newPlayer = {
        id: socket.id,
        name: playerName?.trim() || 'Player 1',
        character: null,
        isReady: true // Host พร้อมเสมอ
      }

      const room = {
        code: roomCode,
        password: password ? String(password).trim() : '',
        hostId: socket.id,
        status: 'lobby',
        players: [newPlayer],
        gameState: null
      }

      rooms.set(roomCode, room)
      socket.join(roomCode)
      socket.data.roomCode = roomCode

      console.log(`[Room Created] ${roomCode} by ${newPlayer.name} (Socket: ${socket.id})`)

      const roomData = serializeRoom(room)
      if (typeof callback === 'function') {
        callback({ success: true, room: roomData })
      }
      io.to(roomCode).emit('room_updated', roomData)
    } catch (err) {
      console.error('Error creating room:', err)
      if (typeof callback === 'function') {
        callback({ success: false, message: 'เกิดข้อผิดพลาดในการสร้างห้อง' })
      }
    }
  })

  // 2. เข้าร่วมห้อง
  socket.on('join_room', ({ roomCode, password, playerName }, callback) => {
    try {
      const formattedCode = roomCode?.trim().toUpperCase()
      const room = rooms.get(formattedCode)

      if (!room) {
        return callback?.({ success: false, message: 'ไม่พบห้องนี้ในระบบ (รหัสห้องไม่ถูกต้อง)' })
      }

      if (room.status === 'playing') {
        return callback?.({ success: false, message: 'เกมในห้องนี้เริ่มไปแล้ว' })
      }

      if (room.players.length >= 4) {
        return callback?.({ success: false, message: 'ห้องเต็มแล้ว (สูงสุด 4 คน)' })
      }

      if (room.password && room.password !== String(password || '').trim()) {
        return callback?.({ success: false, message: 'รหัสผ่านห้องไม่ถูกต้อง' })
      }

      const name = playerName?.trim() || `Player ${room.players.length + 1}`
      const newPlayer = {
        id: socket.id,
        name,
        character: null,
        isReady: false
      }

      room.players.push(newPlayer)
      socket.join(formattedCode)
      socket.data.roomCode = formattedCode

      console.log(`[Player Joined] ${name} joined room ${formattedCode}`)

      const roomData = serializeRoom(room)
      if (typeof callback === 'function') {
        callback({ success: true, room: roomData })
      }
      io.to(formattedCode).emit('room_updated', roomData)
    } catch (err) {
      console.error('Error joining room:', err)
      if (typeof callback === 'function') {
        callback({ success: false, message: 'เกิดข้อผิดพลาดในการเข้าห้อง' })
      }
    }
  })

  // 3. เลือกตัวละคร (int, pointer, const, recursive)
  socket.on('select_character', ({ roomCode, characterId }, callback) => {
    const formattedCode = roomCode?.trim().toUpperCase()
    const room = rooms.get(formattedCode)
    if (!room) return callback?.({ success: false, message: 'ไม่พบห้อง' })

    const player = room.players.find(p => p.id === socket.id)
    if (!player) return callback?.({ success: false, message: 'ไม่พบผู้เล่นในห้อง' })

    if (characterId) {
      const alreadyTaken = room.players.some(p => p.id !== socket.id && p.character === characterId)
      if (alreadyTaken) {
        return callback?.({ success: false, message: 'ตัวละครนี้มีผู้เล่นอื่นเลือกแล้ว' })
      }
    }

    player.character = characterId
    console.log(`[Character Selected] ${player.name} selected ${characterId}`)

    const roomData = serializeRoom(room)
    callback?.({ success: true, room: roomData })
    io.to(formattedCode).emit('room_updated', roomData)
  })

  // 4. สลับสถานะ Ready (พร้อม)
  socket.on('toggle_ready', ({ roomCode }, callback) => {
    const formattedCode = roomCode?.trim().toUpperCase()
    const room = rooms.get(formattedCode)
    if (!room) return

    const player = room.players.find(p => p.id === socket.id)
    if (!player) return

    if (!player.character) {
      return callback?.({ success: false, message: 'กรุณาเลือกตัวละครก่อนกดพร้อม' })
    }

    player.isReady = !player.isReady
    const roomData = serializeRoom(room)
    callback?.({ success: true, room: roomData })
    io.to(formattedCode).emit('room_updated', roomData)
  })

  // 5. สั่งเริ่มเกม (Start Game)
  socket.on('start_game', ({ roomCode, initialGameState }, callback) => {
    const formattedCode = roomCode?.trim().toUpperCase()
    const room = rooms.get(formattedCode)
    if (!room) return callback?.({ success: false, message: 'ไม่พบห้อง' })

    if (room.hostId !== socket.id) {
      return callback?.({ success: false, message: 'เฉพาะ Host เท่านั้นที่เริ่มเกมได้' })
    }

    const unselected = room.players.some(p => !p.character)
    if (unselected) {
      return callback?.({ success: false, message: 'ยังมีผู้เล่นที่ยังไม่ได้เลือกตัวละคร' })
    }

    room.status = 'playing'
    room.gameState = initialGameState
    console.log(`[Game Started] Room ${formattedCode} with ${room.players.length} players`)

    const roomData = serializeRoom(room)
    callback?.({ success: true, room: roomData })
    io.to(formattedCode).emit('game_started', { room: roomData, gameState: initialGameState })
  })

  // 6. ซิงค์สถานะเกมแบบ Real-time (Sync Game State)
  socket.on('sync_game_state', ({ roomCode, gameState }) => {
    const formattedCode = roomCode?.trim().toUpperCase()
    const room = rooms.get(formattedCode)
    if (!room) return

    room.gameState = gameState
    // Broadcast State ล่าสุดไปยังเพื่อนร่วมห้องคนอื่นๆ ทันที
    socket.to(formattedCode).emit('game_state_synced', gameState)
  })

  // 7. เริ่มเกมใหม่ (Restart / Reboot Game)
  socket.on('restart_game', ({ roomCode, newGameState }, callback) => {
    const formattedCode = roomCode?.trim().toUpperCase()
    const room = rooms.get(formattedCode)
    if (!room) return

    room.gameState = newGameState
    callback?.({ success: true })
    io.to(formattedCode).emit('game_state_synced', newGameState)
  })

  // 8. ออกจากห้อง (Leave Room)
  const handleLeaveRoom = () => {
    const roomCode = socket.data.roomCode
    if (!roomCode) return

    const room = rooms.get(roomCode)
    if (!room) return

    room.players = room.players.filter(p => p.id !== socket.id)
    socket.leave(roomCode)
    socket.data.roomCode = null

    console.log(`[Player Left] Socket ${socket.id} left room ${roomCode}`)

    if (room.players.length === 0) {
      rooms.delete(roomCode)
      console.log(`[Room Deleted] Room ${roomCode} is empty`)
    } else {
      if (room.hostId === socket.id) {
        room.hostId = room.players[0].id
        room.players[0].isReady = true
        console.log(`[New Host] Assigned host of ${roomCode} to ${room.players[0].name}`)
      }
      io.to(roomCode).emit('room_updated', serializeRoom(room))
      io.to(roomCode).emit('player_left_notice', { socketId: socket.id })
    }
  }

  socket.on('leave_room', handleLeaveRoom)

  socket.on('disconnect', () => {
    console.log(`[Disconnected] Socket ID: ${socket.id}`)
    handleLeaveRoom()
  })
})

server.listen(PORT, () => {
  console.log(`===========================================`)
  console.log(`🚀 Game Server running on http://localhost:${PORT}`)
  console.log(`===========================================`)
})
