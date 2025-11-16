"use client"

import Image from "next/image"

interface User {
  _id: string
  name: string
  profileImage?: string
  department?: string
  year?: string
  college?: string
  skills?: string[]
}

export default function UsersTable({ users }: { users: User[] }) {
  return (
    <div className="w-full rounded-lg border border-border/40 bg-card/60 backdrop-blur p-4">
      <h2 className="text-lg font-semibold mb-4">All Users</h2>

      <div className="max-h-[450px] overflow-y-auto pr-2 space-y-3">
        {users.length === 0 && (
          <p classnName="text-muted-foreground text-sm text-center">No users found.</p>
        )}

        {users.map((user) => (
          <div
            key={user._id}
            className="flex items-center gap-3 p-2 rounded-md border border-border/40 bg-background/40"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
              <Image
                src={user.profileImage || "/placeholder.svg"}
                alt={user.name}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            </div>

            <div className="flex flex-col">
              <span className="font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">
                {user.department || "Dept"} • {user.year || ""}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
