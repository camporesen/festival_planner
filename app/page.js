'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [artists, setArtists] = useState([])
  const [users, setUsers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: artists } = await supabase.from('artists').select('*')
    const { data: users } = await supabase.from('users').select('*')

    setArtists(artists)
    setUsers(users)
    setCurrentUser(users[0])
  }

  return (
    <main className="p-6 bg-black text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Festival Planner 🎵</h1>

      {currentUser && (
        <select
          value={currentUser.id}
          onChange={(e) =>
            setCurrentUser(users.find(u => u.id === e.target.value))
          }
          className="mb-6 p-2 bg-gray-800 rounded"
        >
          {users.map(u => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      )}

      <div className="grid gap-4">
        {artists.map(artist => (
          <div key={artist.id} className="p-4 bg-gray-900 rounded-xl">
            <h2 className="text-xl">{artist.name}</h2>
            <p className="text-sm text-gray-400">{artist.day}</p>
          </div>
        ))}
      </div>
    </main>
  )
}