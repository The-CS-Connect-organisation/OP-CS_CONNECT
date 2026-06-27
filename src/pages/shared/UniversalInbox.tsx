import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { api } from '@/lib/api'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { cn } from '@/lib/utils'
import {
  Inbox, MessageSquare, Bell, Gavel, CheckCheck, Trash2, Loader2,
  AlertCircle, Info, CheckCircle2,
  XCircle, Megaphone
} from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const typeIcons: Record<string, React.ReactNode> = {
  'message': <MessageSquare className="w-4 h-4 text-blue-500" />,
  'notification': <Bell className="w-4 h-4 text-amber-500" />,
  'auction_update': <Gavel className="w-4 h-4 text-orange-500" />,
  'announcement': <Megaphone className="w-4 h-4 text-purple-500" />,
  'success': <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  'warning': <AlertCircle className="w-4 h-4 text-amber-500" />,
  'error': <XCircle className="w-4 h-4 text-red-500" />,
  'info': <Info className="w-4 h-4 text-blue-500" />,
}

export default function UniversalInbox() {
  const { user } = useAuthStore()
  const [inboxItems, setInboxItems] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetchInbox()
    const interval = setInterval(fetchInbox, 15000)
    return () => clearInterval(interval)
  }, [])

  const fetchInbox = async () => {
    if (!user?.id) return
    try {
      const [inboxData, msgsData, notifData] = await Promise.all([
        api.getInbox(user.id).catch(() => []),
        api.getMessages(user.id).catch(() => []),
        api.getNotifications(user.id).catch(() => []),
      ])
      setInboxItems(Array.isArray(inboxData) ? inboxData : [])
      setMessages(Array.isArray(msgsData) ? msgsData : [])
      setNotifications(Array.isArray(notifData) ? notifData : [])
    } catch (err) {
      console.error('[Inbox] Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkRead = async (id: string) => {
    try {
      await api.markInboxItemRead(id)
      setInboxItems(prev => prev.map(item => item.id === id ? { ...item, read: true } : item))
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const handleMarkAllRead = async () => {
    if (!user?.id) return
    try {
      await api.markAllInboxRead(user.id)
      setInboxItems(prev => prev.map(item => ({ ...item, read: true })))
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.deleteInboxItem(id)
      setInboxItems(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }

  // Combine all items
  const allItems = [
    ...inboxItems.map((i: any) => ({ ...i, source: 'inbox' })),
    ...messages.map((m: any) => ({
      id: m.id,
      title: 'Message',
      message: m.content,
      type: 'message',
      read: m.read,
      timestamp: m.timestamp,
      source: 'messages',
    })),
    ...notifications.map((n: any) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type || 'notification',
      read: n.read,
      timestamp: n.createdAt || n.timestamp,
      source: 'notifications',
    })),
  ].sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())

  const unreadCount = allItems.filter(i => !i.read).length

  const filteredItems = activeTab === 'all' ? allItems :
    activeTab === 'unread' ? allItems.filter(i => !i.read) :
    allItems.filter(i => i.type === activeTab || i.source === activeTab)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
    </div>
  )

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Inbox className="w-6 h-6 text-orange-500" />
            Universal Inbox
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            All your messages, notifications, and updates in one place
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge className="bg-orange-500">{unreadCount} unread</Badge>
          )}
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck className="w-4 h-4 mr-1" /> Mark All Read
            </Button>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="all" className="text-xs">
              All ({allItems.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="message" className="text-xs">
              <MessageSquare className="w-3 h-3 mr-1" /> Messages
            </TabsTrigger>
            <TabsTrigger value="notification" className="text-xs">
              <Bell className="w-3 h-3 mr-1" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="auction_update" className="text-xs">
              <Gavel className="w-3 h-3 mr-1" /> Market
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {filteredItems.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Inbox className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Inbox Zero! 🎉</h3>
                  <p className="text-sm text-muted-foreground">No {activeTab !== 'all' ? activeTab : ''} items to show</p>
                </CardContent>
              </Card>
            ) : (
              <ScrollArea className="h-[calc(100vh-16rem)]">
                <div className="space-y-2">
                  {filteredItems.map((item, idx) => (
                    <motion.div
                      key={`${item.source}-${item.id}-${idx}`}
                      variants={itemVariants}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-lg transition-all cursor-pointer border",
                        item.read
                          ? "bg-background hover:bg-accent/30 border-transparent"
                          : "bg-accent/50 border-l-4 border-l-orange-500"
                      )}
                      onClick={() => !item.read && handleMarkRead(item.id)}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {typeIcons[item.type] || <Info className="w-4 h-4 text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={cn("text-sm truncate", !item.read && "font-semibold")}>
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[10px] text-muted-foreground">
                              {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : ''}
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }}
                              className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <p className={cn("text-xs mt-0.5 line-clamp-2", item.read ? "text-muted-foreground" : "text-foreground")}>
                          {item.message}
                        </p>
                        {item.timestamp && (
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                      {!item.read && (
                        <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 mt-2" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
