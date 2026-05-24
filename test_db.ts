import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://puwfwhcrnprfnyqevlbf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1d2Z3aGNybnByZm55cWV2bGJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MzA5ODYsImV4cCI6MjA5NDMwNjk4Nn0.U33tHIjkcY5X0raBw0iQUPYMLqAEng0Lt3TZqyDEXpo'
);

async function run() {
  const { data, error } = await supabase.from('transactions').select('*').limit(1);
  console.log("Data:", data);
  console.log("Error:", error);
}

run();
