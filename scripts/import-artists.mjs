import * as XLSX from 'xlsx'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Metti qui le tue credenziali Supabase
const SUPABASE_URL = 'https://iexjechrqbhqsxlxxcgv.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY

// Metti qui l'ID del festival che hai creato sull'app
const FESTIVAL_ID = '277b9074-d134-4722-9b4e-0d8143f9dc80'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const workbook = XLSX.read(readFileSync('PS2026 - Si va.xlsm'))
const sheet = workbook.Sheets['Artisti']
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

// Salta la riga di intestazione (riga 0)
const artists = []
for (let i = 1; i < rows.length; i++) {
  const row = rows[i]
  if (!row[3]) continue // salta righe senza nome artista

  const rawDate = row[0]
  const dayLabel = row[1]
  const eventType = row[2]
  const name = row[3]

  // Converti la data Excel in formato YYYY-MM-DD
  // Converti la data Excel in formato YYYY-MM-DD
  let day = null
  if (rawDate) {
    // Le date in Excel sono numeri di giorni dal 1/1/1900
    const excelEpoch = new Date(1899, 11, 30)
    const date = new Date(excelEpoch.getTime() + rawDate * 86400000)
    day = date.toISOString().split('T')[0]
  }

  artists.push({ festival_id: FESTIVAL_ID, name, day, day_label: dayLabel ?? null, event_type: eventType ?? null })
}

console.log(`Trovati ${artists.length} artisti. Caricamento...`)

const { error } = await supabase.from('artists').insert(artists)
if (error) {
  console.error('Errore:', error.message)
} else {
  console.log(`✅ ${artists.length} artisti caricati con successo!`)
}