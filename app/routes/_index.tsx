import type { MetaFunction } from '@vercel/remix'
import { Link } from '@remix-run/react'

export const meta: MetaFunction = () => {
  return [
    { title: 'leni wen\'s games' },
    { name: 'description', content: 'GAMES!' },
  ]
}

export default function Index() {
  return (
    <div>
      <Link to="/hangman">hangman game</Link>
    </div>

  )
}
