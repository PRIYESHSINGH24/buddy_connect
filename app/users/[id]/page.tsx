import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export default async function UserProfilePage({ params }: { params: any }) {
  // `params` can be a Promise in certain Next.js configurations — unwrap it safely
  const { id } = await params
  const db = await getDatabase()
  const user = await db.collection("users").findOne({ _id: new ObjectId(id) }, {
    projection: {
      name: 1,
      profileImage: 1,
      department: 1,
      year: 1,
      college: 1,
      skills: 1,
      bio: 1,
      experience: 1,
      education: 1,
      projects: 1,
      certifications: 1,
      contact: 1,
    }
  })

  if (!user) {
    return (
      <main className="container mx-auto p-8">
        <h1 className="text-xl font-semibold">User not found</h1>
      </main>
    )
  }

  return (
    <main className="container mx-auto p-8">
      <div className="flex items-center gap-4">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-muted">
          {user.profileImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.profileImage} alt={user.name} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl font-bold">{user.name?.charAt(0) || 'U'}</div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <div className="text-sm text-muted-foreground">{user.department} • {user.year} • {user.college}</div>
        </div>
      </div>

      {user.bio && (
        <section className="mt-6">
          <h2 className="font-semibold">About</h2>
          <p className="mt-2 text-muted-foreground">{user.bio}</p>
        </section>
      )}

      {user.skills && user.skills.length > 0 && (
        <section className="mt-6">
          <h2 className="font-semibold">Skills</h2>
          <div className="flex gap-2 mt-2 flex-wrap">
            {user.skills.map((s: string) => (
              <span key={s} className="px-2 py-1 bg-background/60 border border-border rounded text-sm">{s}</span>
            ))}
          </div>
        </section>
      )}

    </main>
  )
}
