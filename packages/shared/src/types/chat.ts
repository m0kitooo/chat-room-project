export type User = {
  id: string
  username: string
  email: string
}

export type Message = {
  id: string
  content: string
  senderId: string
  senderUsername: string
  createdAt: string
}

export type Conversation = {
  id: string
  type: 'DIRECT' | 'GROUP'
  name: string
  lastMessage?: string
  lastMessageAt?: string
  unread?: number
}
