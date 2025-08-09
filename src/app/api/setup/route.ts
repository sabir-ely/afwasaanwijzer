import { NextRequest, NextResponse } from 'next/server'
import { createUser, hasUsers, initDb } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    initDb()
    
    if (hasUsers()) {
      return NextResponse.json({ error: 'Setup already completed' }, { status: 400 })
    }

    const { password } = await request.json()
    
    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 })
    }

    createUser('admin', password, 'admin')
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 })
  }
}

export async function GET() {
  initDb()
  const setupComplete = hasUsers()
  return NextResponse.json({ setupComplete })
}