require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  const { data, error } = await supabase.storage.from('photos').list();
  console.log('Photos bucket root:', data?.length, 'items', error);
  if (data && data.length > 0) {
    console.log('First few items:', data.slice(0, 5));
  }
}
check();
