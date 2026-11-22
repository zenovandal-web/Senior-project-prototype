import { io } from 'socket.io-client'

// หากเปิดจากเครื่องตัวเองในโหมด Dev ให้ชี้ไปที่ localhost:4000
// หากเปิดจากเว็บออนไลน์ (เช่น Vercel) ให้เชื่อมต่อไปที่ Render Server อัตโนมัติ
const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

const DEFAULT_SERVER = isLocal 
  ? 'http://localhost:4000' 
  : 'https://senior-project-prototype.onrender.com'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || DEFAULT_SERVER

export const socket = io(SERVER_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling']
})
