import { useState } from 'react'
import Sidebar from '../components/chat/Sidebar'
import ChatWindow from '../components/chat/ChatWindow'
import type { Conversation } from '../types'
import './ChatPage.css'

const MOCK_CONVERSATIONS: Conversation[] = [
  { id: '1', type: 'DIRECT', name: 'Alice', lastMessage: "Hey, what's up?", lastMessageAt: '10:42', unread: 2 },
  { id: '2', type: 'DIRECT', name: 'Bob', lastMessage: 'See you tomorrow!', lastMessageAt: '09:15', unread: 0 },
  { id: '3', type: 'GROUP', name: 'Dev Team', lastMessage: 'PR is ready for review', lastMessageAt: 'Yesterday', unread: 5 },
  { id: '4', type: 'DIRECT', name: 'Charlie', lastMessage: 'Sounds good 👍', lastMessageAt: 'Mon', unread: 0 },
  { id: '5', type: 'GROUP', name: 'Design', lastMessage: 'Updated the mockups', lastMessageAt: 'Mon', unread: 0 },
]

export default function ChatPage() {
  const [active, setActive] = useState<Conversation | null>(null)

  return (
    <div className="chat-page">
      <Sidebar conversations={MOCK_CONVERSATIONS} active={active} onSelect={setActive} />
      <ChatWindow conversation={active} />
    </div>
  )
}
