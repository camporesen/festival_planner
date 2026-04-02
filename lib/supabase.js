import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://iexjechrqbhqsxlxxcgv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlleGplY2hycWJocXN4bHh4Y2d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMzk1NzksImV4cCI6MjA5MDcxNTU3OX0.QnrcG84hE61s09p9GoSms83QunjUJjA4hNpOJbNRE0wsb_publishable_kn_koXfbAUCX4UwP1B-0_w__4IPGMXC'
)