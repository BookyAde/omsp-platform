const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Use ip-api.com (free, 45 requests per minute)
async function getCountryFromIP(ip) {
  if (!ip || ip === '127.0.0.1' || ip === '::1') return 'Localhost';
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country`);
    const data = await res.json();
    return data.country || 'Unknown';
  } catch (err) {
    console.error(`Error fetching country for ${ip}:`, err);
    return 'Unknown';
  }
}

async function backfill() {
  const { data: submissions, error } = await supabase
    .from('form_submissions')
    .select('id, ip_address')
    .is('country', null)
    .limit(200); // process in batches to respect rate limits

  if (error) throw error;
  console.log(`Found ${submissions.length} submissions without country.`);

  for (let i = 0; i < submissions.length; i++) {
    const sub = submissions[i];
    const country = await getCountryFromIP(sub.ip_address);
    await supabase.from('form_submissions').update({ country }).eq('id', sub.id);
    console.log(`[${i+1}/${submissions.length}] Updated ${sub.id} (${sub.ip_address}) -> ${country}`);
    // Wait 1.5 seconds to stay within 45 requests/minute
    await new Promise(r => setTimeout(r, 1500));
  }
  console.log('Backfill complete.');
}

backfill();