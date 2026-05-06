import { useState, type FormEvent, type KeyboardEvent } from 'react'
import './MessageInput.css'

type Props = {
  onSend: (text: string) => void
}

export default function MessageInput({ onSend }: Props) {
  const [text, setText] = useState('')

  const send = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    send()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <textarea
        placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        maxLength={2000}
        aria-label="Message"
      />
      <button type="submit" className="send-btn" disabled={!text.trim()} aria-label="Send message">
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </form>
  )
}
