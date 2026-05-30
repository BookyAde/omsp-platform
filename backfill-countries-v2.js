const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getCountryFromIP(ip) {
  if (!ip || ip === '127.0.0.1' || ip === '::1') return 'Localhost';
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country`);
    const data = await res.json();
    return data.country || 'Unknown';
  } catch {
    return 'Unknown';
  }
}

async function backfill() {
  // Target rows where country is 'Unknown' or contains error strings
  const { data: submissions, error } = await supabase
    .from('form_submissions')
    .select('id, ip_address, country')
    .eq('country', 'Unknown');  // <-- key change

  if (error) throw error;
  console.log(`Found ${submissions.length} submissions to update.`);

  for (let i = 0; i < submissions.length; i++) {
    const sub = submissions[i];
    if (!sub.ip_address) {
      console.log(`[${i+1}/${submissions.length}] No IP for ${sub.id}, skipping.`);
      continue;
    }
    const country = await getCountryFromIP(sub.ip_address);
    await supabase.from('form_submissions').update({ country }).eq('id', sub.id);
    console.log(`[${i+1}/${submissions.length}] ${sub.id} (${sub.ip_address}) → ${country}`);
    await new Promise(r => setTimeout(r, 1500));
  }
  console.log('Backfill complete.');
}

backfill();