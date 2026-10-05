import { prisma } from "@/lib/prisma"

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  const { id } = params
  const found = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      profileImage: true,
      department: true,
      year: true,
      college: true,
      skills: true,
      bio: true,
      experience: true,
      education: true,
      projects: true,
      certifications: true,
      contact: true,
      socials: true,
      username: true,
      featuredProjectIds: true,
      endorsements: true,
    },
  })
  const user = found ? { ...found, socials: (found.socials as any) || null } : null

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

      {/* Public link + QR */}
      {(user.username) && (
        <section className="mt-4 flex items-center gap-4">
          <div className="text-sm">Public Profile: <span className="font-medium">/u/{user.username}</span></div>
          {/* Simple QR using external service to avoid extra deps */}
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL || ''}/u/${user.username}`)}`}
            alt="QR to profile"
            className="w-20 h-20 border rounded"
          />
        </section>
      )}

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

      {/* Socials */}
      {user.socials && (
        <section className="mt-6">
          <h2 className="font-semibold">Socials</h2>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {user.socials.website && <a className="text-primary hover:underline" target="_blank" href={user.socials.website}>Website</a>}
            {user.socials.github && <a className="text-primary hover:underline" target="_blank" href={`https://${user.socials.github.replace(/^https?:\/\//,'')}`}>GitHub</a>}
            {user.socials.leetcode && <a className="text-primary hover:underline" target="_blank" href={`https://${user.socials.leetcode.replace(/^https?:\/\//,'')}`}>LeetCode</a>}
            {user.socials.codeforces && <a className="text-primary hover:underline" target="_blank" href={`https://${user.socials.codeforces.replace(/^https?:\/\//,'')}`}>Codeforces</a>}
          </div>
        </section>
      )}

      {/* Featured Projects */}
      {user.featuredProjectIds && user.featuredProjectIds.length > 0 && (
        <FeaturedProjects ids={user.featuredProjectIds} />
      )}

    </main>
  )
}

// Server component to render featured projects minimal list
async function FeaturedProjects({ ids }: { ids: string[] }) {
  if (ids.length === 0) return null
  const projects = await prisma.project.findMany({
    where: { id: { in: ids } },
    select: { id: true, title: true, description: true, githubUrl: true },
  })
  if (projects.length === 0) return null
  return (
    <section className="mt-6">
      <h2 className="font-semibold">Featured Projects</h2>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((p) => (
          <a key={p.id} href={p.githubUrl} target="_blank" className="block border rounded p-3 hover:bg-accent/30">
            <div className="font-medium">{p.title}</div>
            {p.description && <div className="text-sm text-muted-foreground line-clamp-3">{p.description}</div>}
          </a>
        ))}
      </div>
    </section>
  )
}
