import Link from 'next/link'
import Card from './Card'

export default function SessionCard({ session }) {
  const date = new Date(session.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  
  return (
    <Link href={`/session/${session.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <h3 className="text-lg font-semibold mb-2">
          {session.title || 'Untitled Session'}
        </h3>
        <p className="text-sm text-gray-600 mb-2">{date}</p>
        {session.summary && (
          <p className="text-sm text-gray-500 line-clamp-2">{session.summary}</p>
        )}
      </Card>
    </Link>
  )
}

