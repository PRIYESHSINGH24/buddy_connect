"use client"

import React, { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

interface UserItem {
  _id: string
  name: string
  profileImage?: string
}

interface Message {
  _id: string
  from: string
  to: string
  content: string
  createdAt: string
}

export default function MessageBar() {
  const [open, setOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<any | null>(null)
  const [users, setUsers] = useState<UserItem[]>([])
  const [connections, setConnections] = useState<string[]>([])
  const [selected, setSelected] = useState<UserItem | null>(null)
  const [pendingOpenUserId, setPendingOpenUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loadingMessages, setLoadingMessages] = useState(false)
  const messagesRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // load current user and users in parallel
    const init = async () => {
      try {
        const meRes = await fetch("/api/auth/me")
        if (!meRes.ok) return
        const me = await meRes.json()
        setCurrentUser(me)
        setConnections(me.connections || [])

        const usersRes = await fetch("/api/users")
        if (!usersRes.ok) return
        const usersData = await usersRes.json()
        setUsers(usersData.users || [])
      } catch (err) {
        console.error(err)
      }
    }

    if (open) init()
  }, [open])

  // Listen for global toggle event triggered by navbar buttons
  useEffect(() => {
    const handler = () => setOpen((o) => !o)
    window.addEventListener("toggleMessages", handler)
    return () => window.removeEventListener("toggleMessages", handler)
  }, [])

  // Listen for other components requesting to open a conversation by user id
  useEffect(() => {
    const openHandler = (e: Event) => {
      try {
        const detail = (e as CustomEvent)?.detail as { userId?: string } | undefined
        const userId = detail?.userId
        if (!userId) return
        setOpen(true)
        setPendingOpenUserId(userId)
      } catch (err) {
        console.error("openConversation event error", err)
      }
    }

    window.addEventListener("openConversation", openHandler as EventListener)
    return () => window.removeEventListener("openConversation", openHandler as EventListener)
  }, [])

  // When users have loaded and a pending open request exists, open it
  useEffect(() => {
    if (!pendingOpenUserId) return
    if (users.length === 0) return
    const u = users.find((x) => x._id === pendingOpenUserId)
    if (u) {
      setPendingOpenUserId(null)
      // small timeout to ensure UI is ready
      setTimeout(() => openConversation(u), 0)
    }
  }, [users, pendingOpenUserId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesRef.current) {
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight
      }
    }, 50)
  }

  const openConversation = async (u: UserItem) => {
    setSelected(u)
    setMessages([])
    setLoadingMessages(true)
    try {
      const res = await fetch(`/api/messages?with=${u._id}`)
      if (!res.ok) {
        const json = await res.json()
        console.error("Failed to load messages:", json)
        setLoadingMessages(false)
        return
      }
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleSend = async () => {
    if (!selected || !input.trim()) return
    try {
      const res = await fetch(`/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: selected._id, content: input.trim() }),
      })
      if (!res.ok) {
        console.error(await res.json())
        return
      }
      const json = await res.json()
      setMessages((m) => [...m, json.message])
      setInput("")
    } catch (err) {
      console.error(err)
    }
  }

  const myConnections = users.filter((u) => connections.includes(u._id))

  return (
    <div>
      {open && (
        <div className="fixed right-4 top-24 z-50 w-[360px] h-[70vh] bg-card/90 border border-border/50 rounded-md shadow-lg overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-border/30">
            <div className="font-semibold">Messages</div>
            <div>
              <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </div>

          <div className="flex h-[calc(100%-96px)]">
            <div className="w-1/3 border-r border-border/30 overflow-y-auto">
              <div className="p-2">
                {myConnections.length === 0 && <div className="text-sm text-muted-foreground">No connections</div>}
                {myConnections.map((u) => (
                  <div
                    key={u._id}
                    className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-background/50 ${selected?._id===u._id?"bg-background/60":""}`}
                    onClick={() => openConversation(u)}
                  >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-muted">
                        <a href={`/users/${u._id}`}>
                          <img src={u.profileImage || '/placeholder.svg'} alt={u.name} className="object-cover w-full h-full" />
                        </a>
                      </div>
                      <div className="font-medium"><a href={`/users/${u._id}`}>{u.name}</a></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-2/3 flex flex-col">
              <div className="flex-1 overflow-y-auto p-3" ref={messagesRef}>
                {!selected && <div className="text-sm text-muted-foreground">Select a connection to start chatting</div>}

                {loadingMessages && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner className="w-4 h-4" />
                    <span>Loading messages...</span>
                  </div>
                )}

                {messages.map((m) => (
                  <div key={m._id} className={`mb-3 max-w-[80%] ${m.from===currentUser?._id?"ml-auto text-right":""}`}>
                    <div className="px-3 py-2 rounded-md bg-muted/60 inline-block">{m.content}</div>
                    <div className="text-xs text-muted-foreground mt-1">{new Date(m.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t border-border/30">
                <div className="flex gap-2">
                  <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={selected?`Message ${selected.name}`:"Select a connection"} />
                  <Button onClick={handleSend} disabled={!selected || !input.trim()}>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
