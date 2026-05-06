import { useRef, useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import type { Conversation, Message } from '../../types'
import MessageInput from './MessageInput'
import './ChatWindow.css'

type Props = {
  conversation: Conversation | null
}

const MOCK_MESSAGES: Record<string, Message[]> = {
  '1': [
    { id: 'm1', content: 'Hey! How are you?', senderId: 'other', senderUsername: 'Alice', createdAt: '2026-05-04T08:30:00Z' },
    { id: 'm2', content: "I'm great, thanks! You?", senderId: 'me', senderUsername: 'me', createdAt: '2026-05-04T08:31:00Z' },
    { id: 'm3', content: 'Doing well! Working on anything cool?', senderId: 'other', senderUsername: 'Alice', createdAt: '2026-05-04T08:32:00Z' },
    { id: 'm4', content: 'Yeah, building a chat app actually 😄', senderId: 'me', senderUsername: 'me', createdAt: '2026-05-04T08:33:00Z' },
    { id: 'm5', content: "Hey, what's up?", senderId: 'other', senderUsername: 'Alice', createdAt: '2026-05-04T10:42:00Z' },
  ],
  '2': [
    { id: 'm1', content: 'Hey, are we still on for tomorrow?', senderId: 'me', senderUsername: 'me', createdAt: '2026-05-03T18:00:00Z' },
    { id: 'm2', content: 'See you tomorrow!', senderId: 'other', senderUsername: 'Bob', createdAt: '2026-05-03T18:05:00Z' },
  ],
  '3': [
    { id: 'm1', content: 'PR is ready for review', senderId: 'other', senderUsername: 'Charlie', createdAt: '2026-05-03T14:00:00Z' },
    { id: 'm2', content: 'Will take a look!', senderId: 'me', senderUsername: 'me', createdAt: '2026-05-03T14:10:00Z' },
  ],
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function MsgAvatar({ name }: { name: string }) {
  return (
    <div className="msg-avatar" aria-hidden="true">
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export default function ChatWindow({ conversation }: Props) {
  const { user } = useAuth()
  const bottomRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    setMessages(conversation ? (MOCK_MESSAGES[conversation.id] ?? []) : [])
  }, [conversation?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (text: string) => {
    if (!conversation || !user) return
    const msg: Message = {
      id: `m${Date.now()}`,
      content: text,
      senderId: user.id,
      senderUsername: user.username,
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, msg])
  }

  if (!conversation) {
    return (
      <div className="chat-window chat-empty">
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" width="52" height="52" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p>Select a conversation to start chatting</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-window">
      <header className="chat-header">
        <div className="chat-header-avatar" aria-hidden="true">
          {conversation.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="chat-header-name">{conversation.name}</div>
          <div className="chat-header-sub">
            {conversation.type === 'GROUP' ? 'Group conversation' : 'Direct message'}
          </div>
        </div>
      </header>

      <div className="messages-area" role="log" aria-live="polite">
        {messages.map((msg, i) => {
          const isMe = msg.senderId === user?.id || msg.senderId === 'me'
          const prevSender = i > 0 ? messages[i - 1].senderId : null
          const showAvatar = !isMe && prevSender !== msg.senderId

          return (
            <div key={msg.id} className={`msg-row${isMe ? ' msg-me' : ' msg-other'}`}>
              {!isMe && (
                <div className="msg-avatar-col">
                  {showAvatar ? <MsgAvatar name={msg.senderUsername} /> : <div className="msg-avatar-spacer" />}
                </div>
              )}
              <div className="msg-content">
                {!isMe && showAvatar && (
                  <span className="msg-sender">{msg.senderUsername}</span>
                )}
                <div className="msg-bubble">{msg.content}</div>
                <span className="msg-time">{formatTime(msg.createdAt)}</span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <MessageInput onSend={handleSend} />
    </div>
  )
}
