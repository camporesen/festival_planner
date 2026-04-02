import * as XLSX from 'xlsx'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const SUPABASE_URL = 'https://iexjechrqbhqsxlxxcgv.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY
const FESTIVAL_ID = '277b9074-d134-4722-9b4e-0d8143f9dc80'
const USER_ID = '39b2c8c8-6edf-4893-81ad-73e1a6240158'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const workbook = XLSX.read(readFileSync('PS2026 - Si va.xlsm'))
const sheet = workbook.Sheets['Artisti']
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

// Recupera tutti gli artisti dal DB per matchare per nome
const { data: artists } = await supabase
  .from('artists')
  .select('id, name')
  .eq('festival_id', FESTIVAL_ID)

const artistMap = {}
for (const a of artists) {
  artistMap[a.name.trim().toLowerCase()] = a.id
}

const ratings = []
for (let i = 1; i < rows.length; i++) {
  const row = rows[i]
  const name = row[3]
  if (!name) continue

  const artistId = artistMap[name.trim().toLowerCase()]
  if (!artistId) {
    console.warn(`Artista non trovato: ${name}`)
    continue
  }

  // Colonne Excel: 4=Interesse Campo, 5=Priorità Campo, 6=Curiosità Campo, 7=Già visto Campo
  const interest  = row[4] ? Math.round(row[4]) : null
  const priority  = row[5] ? Math.round(row[5]) : null
  const curiosity = row[6] ? Math.round(row[6]) : null
  const alreadySeen = row[7] === 'Sì' || row[7] === 'Si' || row[7] === true

  // Salta se non ha votato niente
  if (!interest && !priority && !curiosity) continue

  ratings.push({
    artist_id: artistId,
    user_id: USER_ID,
    festival_id: FESTIVAL_ID,
    interest,
    priority,
    curiosity,
    already_seen: alreadySeen,
    updated_at: new Date().toISOString(),
  })
}

console.log(`Trovati ${ratings.length} voti da importare...`)

// Inserisci a blocchi di 50
for (let i = 0; i < ratings.length; i += 50) {
  const chunk = ratings.slice(i, i + 50)
  const { error } = await supabase.from('ratings').upsert(chunk, { onConflict: 'artist_id,user_id' })
  if (error) console.error(`Errore blocco ${i}:`, error.message)
  else console.log(`✅ Importati ${Math.min(i + 50, ratings.length)}/${ratings.length}`)
}

console.log('Fatto!')