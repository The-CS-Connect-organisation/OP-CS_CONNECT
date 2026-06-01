import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useAuthStore } from '@/lib/store'
import { api } from '@/lib/api'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { EmojiPicker, EmojiPickerSearch, EmojiPickerContent } from '@/components/ui/emoji-picker'
import { MessageSquare, Send, Search, Phone, Video, Smile, X, ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  from: string
  to: string
  content: string
  timestamp: string
  read: boolean
}

interface Contact {
  id: string
  name: string
  initials: string
  role: string
  lastMessage?: string
  unread?: number
  avatar?: string
}

export default function MessagesPage() {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 8000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, selectedContact])

  const fetchMessages = async () => {
    try {
      const [msgsData, usersData] = await Promise.all([
        api.getMessages(user?.id || '').catch(() => []),
        api.getUsers().catch(() => [])
      ])
      const msgs = Array.isArray(msgsData) ? msgsData : []
      setMessages(msgs)

      const allUsers = Array.isArray(usersData) ? usersData : []
      const otherUsers = allUsers.filter((u: any) => u.id !== user?.id)
      const contactList: Contact[] = otherUsers.map((u: any) => {
        const userMsgs = msgs.filter((m: any) => m.from === u.id || m.to === u.id)
        const lastMsg = userMsgs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
        const unread = userMsgs.filter((m: any) => m.to === user?.id && !m.read).length
        return {
          id: u.id,
          name: u.name,
          initials: u.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2),
          role: u.role,
          lastMessage: lastMsg?.content,
          unread,
          avatar: u.avatar || ''
        }
      })
      setContacts(contactList)
      if (contactList.length > 0 && !selectedContact) setSelectedContact(contactList[0])
    } catch (err) { console.error('[Messages] Failed to fetch messages:', err) } finally { setLoading(false) }
  }

  const conversation = useMemo(() =>
    messages
      .filter(m => (m.from === selectedContact?.id && m.to === user?.id) || (m.from === user?.id && m.to === selectedContact?.id))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    [messages, selectedContact?.id, user?.id]
  )

  const handleSend = async () => {
    if (!replyText.trim() || !selectedContact) return
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      from: user?.id || '',
      to: selectedContact.id,
      content: replyText,
      timestamp: new Date().toISOString(),
      read: true,
    }
    const prevMessages = messages
    setMessages(prev => [...prev, optimistic])
    setReplyText('')
    try {
      await api.sendMessage(user?.id || '', selectedContact.id, replyText)
    } catch (err) {
      console.error('[Messages] Failed to send message:', err)
      setMessages(prevMessages)
    }
  }

  const filteredContacts = useMemo(() =>
    contacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [contacts, searchQuery]
  )

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-muted-foreground">Loading messages...</div></div>

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="flex h-full rounded-lg border overflow-hidden">
        <div className={cn("w-80 border-r flex-col flex-shrink-0", showSidebar ? "flex" : "hidden", "lg:flex")}>
          <div className="p-3 border-b">
            <h2 className="font-semibold text-lg mb-2">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search contacts..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
          </div>
          <ScrollArea className="flex-1">
            {filteredContacts.map(contact => (
              <button
                key={contact.id}
                onClick={() => { setSelectedContact(contact); setShowSidebar(false) }}
                className={cn("w-full flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors text-left border-b last:border-b-0", selectedContact?.id === contact.id && "bg-accent")}
              >
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage src={contact.avatar} />
                  <AvatarFallback className={cn("text-xs font-semibold", contact.role === 'teacher' ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" : contact.role === 'admin' ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300")}>
                    {contact.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{contact.name}</span>
                    {contact.unread && contact.unread > 0 && <span className="w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">{contact.unread}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{contact.lastMessage || 'No messages yet'}</p>
                </div>
              </button>
            ))}
          </ScrollArea>
        </div>

        <div className={cn("flex-1 flex-col", showSidebar ? "hidden" : "flex", "lg:flex")}>
          {selectedContact ? (
            <>
              <div className="h-14 border-b flex items-center px-4 gap-3">
                <button onClick={() => setShowSidebar(true)} className="lg:hidden p-1 -ml-1 rounded-lg hover:bg-accent transition-all">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs bg-orange-100 text-orange-700">{selectedContact.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold">{selectedContact.name}</h3>
                  <p className="text-xs text-muted-foreground capitalize">{selectedContact.role}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon"><Phone className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon"><Video className="w-4 h-4" /></Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {conversation.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Start a conversation with {selectedContact.name}</p>
                    </div>
                  )}
                  {conversation.map(msg => {
                    const isMine = msg.from === user?.id
                    return (
                      <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                        <div className={cn("max-w-[70%] rounded-2xl px-4 py-2.5 text-sm", isMine ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary rounded-bl-md")}>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <p className={cn("text-[10px] mt-1", isMine ? "text-primary-foreground/60" : "text-muted-foreground")}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="p-3 border-t flex items-center gap-2 relative">
                <div className="flex-1 relative">
                  <Input
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                    placeholder="Type a message..."
                    className="pr-10"
                  />
                  <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <Smile className="w-4 h-4" />
                  </button>
                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-12 right-0 z-10">
                        <div className="relative">
                          <button onClick={() => setShowEmojiPicker(false)} className="absolute top-1 right-1 z-20"><X className="w-4 h-4" /></button>
                          <EmojiPicker className="h-[300px] w-[280px] rounded-lg border shadow-lg" onEmojiSelect={({ emoji }) => { setReplyText(prev => prev + emoji); setShowEmojiPicker(false) }}>
                            <EmojiPickerSearch />
                            <EmojiPickerContent />
                          </EmojiPicker>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <Button onClick={handleSend} disabled={!replyText.trim()} size="icon" className="bg-orange-500 hover:bg-orange-600">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Select a conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
