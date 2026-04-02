import * as XLSX from 'xlsx'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const SUPABASE_URL = 'https://iexjechrqbhqsxlxxcgv.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY
const FESTIVAL_ID = '277b9074-d134-4722-9b4e-0d8143f9dc80'
const USER_ID = '0e57761b-374d-4950-83d5-ca41ab680447'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const workbook = XLSX.read(readFileSync('PS2026 - Si va.xlsm'))
const sheet = workbook.Sheets['Artisti']
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

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

  // Colonne Gimbo: 8=Interesse, 9=Priorità, 10=Curiosità, 11=Già visto
  const interest  = row[8] ? Math.round(row[8]) : null
  const priority  = row[9] ? Math.round(row[9]) : null
  const curiosity = row[10] ? Math.round(row[10]) : null
  const alreadySeen = row[11] === 'Sì' || row[11] === 'Si' || row[11] === true

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

console.log(`Trovati ${ratings.length} voti di Gimbo. Caricamento...`)

for (let i = 0; i < ratings.length; i += 50) {
  const chunk = ratings.slice(i, i + 50)
  const { error } = await supabase.from('ratings').upsert(chunk, { onConflict: 'artist_id,user_id' })
  if (error) console.error(`Errore blocco ${i}:`, error.message)
  else console.log(`✅ Importati ${Math.min(i + 50, ratings.length)}/${ratings.length}`)
}

console.log('Fatto!')