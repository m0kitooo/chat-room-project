import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import type { Conversation } from '../../types'
import './Sidebar.css'

type Props = {
  conversations: Conversation[]
  active: Conversation | null
  onSelect: (c: Conversation) => void
}

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <div
      className="avatar"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      aria-hidden="true"
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export default function Sidebar({ conversations, active, onSelect }: Props) {
  const { user, logout } = useAuth()
  const [search, setSearch] = useState('')

  const filtered = conversations.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Messages</h2>
      </div>

      <div className="sidebar-search">
        <div className="search-wrap">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Search conversations…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search conversations"
          />
        </div>
      </div>

      <nav className="sidebar-list" aria-label="Conversations">
        {filtered.length === 0 ? (
          <p className="sidebar-empty">No conversations found</p>
        ) : (
          filtered.map(c => (
            <button
              key={c.id}
              type="button"
              className={`conv-item${active?.id === c.id ? ' active' : ''}`}
              onClick={() => onSelect(c)}
              aria-current={active?.id === c.id ? 'true' : undefined}
            >
              <Avatar name={c.name} />
              <div className="conv-info">
                <div className="conv-row">
                  <span className="conv-name">{c.name}</span>
                  {c.lastMessageAt && <span className="conv-time">{c.lastMessageAt}</span>}
                </div>
                <div className="conv-row">
                  <span className="conv-last">{c.lastMessage ?? ''}</span>
                  {!!c.unread && <span className="conv-badge">{c.unread}</span>}
                </div>
              </div>
            </button>
          ))
        )}
      </nav>

      <div className="sidebar-footer">
        <Avatar name={user!.username} size={36} />
        <div className="user-info">
          <span className="user-name">{user!.username}</span>
          <span className="user-email">{user!.email}</span>
        </div>
        <button type="button" className="logout-btn" onClick={logout} title="Log out" aria-label="Log out">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>
  )
}
