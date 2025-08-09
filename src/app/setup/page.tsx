'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Setup() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const response = await fetch('/api/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })

    if (response.ok) {
      router.push('/login')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-4 w-80">
        <h1 className="text-2xl font-bold">Admin Setup</h1>
        <p className="text-gray-600">Kies een wachtwoord voor de admin gebruiker</p>
        <input
          type="password"
          placeholder="Admin wachtwoord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button 
          type="submit" 
          disabled={loading}
          className="w-full p-2 bg-green-500 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Instellen...' : 'Admin Aanmaken'}
        </button>
      </form>
    </div>
  )
}