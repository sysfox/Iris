import type { NextRequest } from 'next/server'

import { guardDbEnabled } from '~/lib/api-guard'
import { DbManager } from '~/lib/db'
import { reactions } from '~/schemas'

import { ReactionDto } from './dto'

export const POST = guardDbEnabled(async (req: NextRequest) => {
  const { refKey, reaction } = ReactionDto.parse(await req.json())

  const db = DbManager.shared.getDb()
  try {
    await db.insert(reactions).values({
      refKey,
      reaction,
    })
    return new Response('', { status: 201 })
  } catch (error) {
    console.error('Failed to add reaction:', error)
    return new Response('Failed to add reaction', { status: 500 })
  }
})
