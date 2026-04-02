interface Rating {
  interest?: number
  priority?: number
  curiosity?: number
  already_seen?: boolean
}

interface Config {
  weight_interest: number
  weight_priority: number
  weight_curiosity: number
  weight_never_seen: number
  threshold_must_see: number
  threshold_high: number
  threshold_consider: number
}

interface MemberRating {
  user_id: string
  display_name: string
  rating: Rating
}

export function calculateScore(memberRatings: MemberRating[], config: Config): number {
  const valid = memberRatings.filter(m =>
    m.rating.interest !== undefined ||
    m.rating.priority !== undefined ||
    m.rating.curiosity !== undefined
  )
  if (valid.length === 0) return 0

  const avg = (vals: (number | undefined)[]) => {
    const v = vals.filter((n): n is number => n !== undefined && n > 0)
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0
  }

  const neverSeenCount = valid.filter(m => !m.rating.already_seen).length
  const neverSeenBonus = neverSeenCount === valid.length ? 1 : neverSeenCount > 0 ? 0.5 : 0

  return Math.round((
    avg(valid.map(m => m.rating.interest))  * config.weight_interest  +
    avg(valid.map(m => m.rating.priority))  * config.weight_priority  +
    avg(valid.map(m => m.rating.curiosity)) * config.weight_curiosity +
    neverSeenBonus * config.weight_never_seen
  ) * 10) / 10
}

export function getCategory(score: number, config: Config): 'MUST SEE' | 'ALTO' | 'VALUTA' | 'SKIP' {
  if (score >= config.threshold_must_see) return 'MUST SEE'
  if (score >= config.threshold_high)     return 'ALTO'
  if (score >= config.threshold_consider) return 'VALUTA'
  return 'SKIP'
}