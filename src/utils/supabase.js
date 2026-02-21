import { createClient } from '@supabase/supabase-js';

// TODO: Replace these with your actual Supabase URL and Anon Key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dazpwzgqkxkxzsakjear.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhenB3emdxa3hreHpzYWtqZWFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NTc0NDUsImV4cCI6MjA4NzIzMzQ0NX0.mfsB2emHhbzIgxyhgFKctVwsuSeiNtEY7JuhY281OWA';

export const supabase = createClient(supabaseUrl, supabaseKey);
