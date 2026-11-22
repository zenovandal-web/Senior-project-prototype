import { io } from 'socket.io-client'

// หากมีตัวแปร VITE_SERVER_URL ให้ใช้ค่านั้น หรือ fallback มาที่ localhost:4000
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000'

export const socket = io(SERVER_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling']
})
