"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface User {
  _id: string
  name: string
  profileImage?: string
  department?: string
  year?: string
  college?: string
  skills?: string[]
}

export default function UsersTable({
  users,
  currentUser,
  onUpdateCurrentUser,
  loading,
}: {
  users: User[]
  currentUser?: { _id: string; connections?: string[]; incomingRequests?: string[]; outgoingRequests?: string[] }
  onUpdateCurrentUser?: () => void
  loading?: boolean
}) {
  const sendRequest = async (targetId: string) => {
    try {
      const res = await fetch(`/api/users/${targetId}/connect`, { method: "POST" })
      if (res.ok && onUpdateCurrentUser) onUpdateCurrentUser()
    } catch (err) {
      console.error(err)
    }
  }

  const respondRequest = async (targetId: string, action: "accept" | "decline") => {
    try {
      const res = await fetch(`/api/users/${currentUser?._id}/connect/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requesterId: targetId, action }),
      })
      if (res.ok && onUpdateCurrentUser) onUpdateCurrentUser()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="w-full rounded-lg border border-border/40 bg-card/60 backdrop-blur p-4">
      <h2 className="text-lg font-semibold mb-4">All Users</h2>

      <div className="max-h-[450px] overflow-y-auto pr-2 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-16 rounded-md" />
          ))
        ) : users.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center">No users found.</p>
        ) : (
          users.map((u) => {
            const isMe = u._id === currentUser?._id
            const isConnected = currentUser?.connections?.includes(u._id)
            const outgoing = currentUser?.outgoingRequests?.includes(u._id)
            const incoming = currentUser?.incomingRequests?.includes(u._id)

            return (
              <div
                key={u._id}
                className="flex items-center gap-3 p-2 rounded-md border border-border/40 bg-background/40"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                  <a href={`/users/${u._id}`}>
                    <Image
                      src={u.profileImage || "/placeholder.svg"}
                      alt={u.name}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  </a>
                </div>

                <div className="flex-1 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-medium"><a href={`/users/${u._id}`}>{u.name}</a></span>
                    <span className="text-xs text-muted-foreground">
                      {u.department || "Dept"} • {u.year || ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isMe ? null : isConnected ? (
                      <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('openConversation', { detail: { userId: u._id } }))} className="text-sm text-primary font-medium">
                        Message
                      </button>
                    ) : incoming ? (
                      <>
                        <Button size="sm" variant="default" onClick={() => respondRequest(u._id, "accept")}>Accept</Button>
                        <Button size="sm" variant="outline" onClick={() => respondRequest(u._id, "decline")}>Decline</Button>
                      </>
                    ) : outgoing ? (
                      <Button size="sm" variant="ghost" disabled>Requested</Button>
                    ) : (
                      <Button size="sm" variant="default" onClick={() => sendRequest(u._id)}>Connect</Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
