"use client"
import React, { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { ScrollArea } from "@/components/ui/ScrollArea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { CardDescription, CardTitle } from "@/components/ui/Card"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/DropdownMenu"
import { ChevronUp, CircleFadingPlus, CircleOff, CircleUserRound, File, Image, ListFilter, MessageCircle, MessageSquareDashed, MessageSquareDot, Mic, Paperclip, Phone, Search, Send, Settings, Smile, SquarePen, Star, User, User2, UserRound, Users, Video } from "lucide-react"

const contactList = [
  { name: "Aarav Sharma", message: "Your Last Message Here", image: "", initials: "AS" },
  { name: "Priya Patel", message: "Hello, how are you?", image: "", initials: "PP" },
  { name: "Rohan Kumar", message: "Looking forward to the meeting.", image: "", initials: "RK" },
  { name: "Ananya Singh", message: "Can you send the report?", image: "", initials: "AS" },
  { name: "Dr. Rajesh Gupta", message: "Thank you for your help!", image: "", initials: "RG" },
  { name: "Prof. Sunita Verma", message: "Let's catch up soon.", image: "", initials: "SV" },
  { name: "Principal Meera", message: "I will call you later.", image: "", initials: "PM" },
  { name: "Mr. Vikram", message: "Did you receive my email?", image: "", initials: "MV" },
  { name: "Raju Kumar", message: "Meeting rescheduled to tomorrow.", image: "", initials: "RK" },
  { name: "Mrs. Sharma", message: "Happy birthday! Have a great day!", image: "", initials: "MS" },
  { name: "Dr. Bookman", message: "What's the update?", image: "", initials: "DB" },
  { name: "Mr. Arjun Manager", message: "Hope you're doing well!", image: "", initials: "AM" },
]

interface ChatTemplateProps {
  contacts?: typeof contactList
  onSendMessage?: (contact: typeof contactList[0], message: string) => void
  currentUserId?: string
}

export function ChatTemplate({ contacts = contactList, onSendMessage, currentUserId }: ChatTemplateProps) {
  const [currentChat, setCurrentChat] = useState(contacts[0])
  const [messageInput, setMessageInput] = useState("")

  const handleSend = () => {
    if (!messageInput.trim()) return
    onSendMessage?.(currentChat, messageInput.trim())
    setMessageInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full min-h-[500px] rounded-lg border">
      <ResizablePanel defaultSize={30} minSize={20} className="flex-grow">
        <div className="flex flex-col h-full border-r">
          <div className="h-14 px-4 flex items-center border-b">
            <p className="font-semibold">Chats</p>
            <div className="flex justify-end w-full gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><SquarePen className="w-4 h-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem><User className="w-4 h-4 mr-2" /> New Contact</DropdownMenuItem>
                  <DropdownMenuItem><Users className="w-4 h-4 mr-2" /> New Group</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><ListFilter className="w-4 h-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter Chats By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem><MessageSquareDot className="w-4 h-4 mr-2" /> Unread</DropdownMenuItem>
                    <DropdownMenuItem><Star className="w-4 h-4 mr-2" /> Favorites</DropdownMenuItem>
                    <DropdownMenuItem><CircleUserRound className="w-4 h-4 mr-2" /> Contacts</DropdownMenuItem>
                    <DropdownMenuItem><CircleOff className="w-4 h-4 mr-2" /> Non Contacts</DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem><Users className="w-4 h-4 mr-2" /> Groups</DropdownMenuItem>
                    <DropdownMenuItem><MessageSquareDashed className="w-4 h-4 mr-2" /> Drafts</DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="relative px-3 py-2">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search or start new chat" className="pl-9" />
          </div>
          <ScrollArea className="flex-grow">
            {contacts.map((contact, index) => (
              <button key={index} onClick={() => setCurrentChat(contact)} className={`px-4 w-full py-3 hover:bg-accent cursor-pointer text-left transition-colors ${currentChat.name === contact.name ? 'bg-accent' : ''}`}>
                <div className="flex flex-row gap-3 items-center">
                  <Avatar className="size-10">
                    <AvatarImage src={contact.image} />
                    <AvatarFallback className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">{contact.initials}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5 min-w-0">
                    <CardTitle className="text-sm truncate">{contact.name}</CardTitle>
                    <CardDescription className="truncate">{contact.message}</CardDescription>
                  </div>
                </div>
              </button>
            ))}
          </ScrollArea>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={70} minSize={40}>
        <div className="flex flex-col h-full">
          <div className="h-16 border-b flex items-center px-4 gap-3">
            <Avatar className="size-10">
              <AvatarImage src={currentChat?.image} />
              <AvatarFallback className="bg-orange-100 text-orange-700">{currentChat?.initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-0.5 flex-1">
              <CardTitle className="text-base">{currentChat?.name}</CardTitle>
              <CardDescription>Online</CardDescription>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon"><Video className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon"><Phone className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon"><Search className="w-4 h-4" /></Button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Select a chat to start messaging</p>
            </div>
          </div>
          <div className="flex h-14 px-3 border-t items-center gap-1">
            <Button variant="ghost" size="icon"><Smile className="w-4 h-4" /></Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><Paperclip className="w-4 h-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem><Image className="w-4 h-4 mr-2" /> Photos & Videos</DropdownMenuItem>
                <DropdownMenuItem><File className="w-4 h-4 mr-2" /> Document</DropdownMenuItem>
                <DropdownMenuItem><UserRound className="w-4 h-4 mr-2" /> Contact</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Input className="flex-1 border-0 focus-visible:ring-0" placeholder="Type a message" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyDown={handleKeyDown} />
            <Button variant="ghost" size="icon" onClick={handleSend}><Send className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon"><Mic className="w-4 h-4" /></Button>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
