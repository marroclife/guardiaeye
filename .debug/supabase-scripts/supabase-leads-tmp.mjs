import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jifjcajdzpwqttgkswyp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppZmpjYWpkenB3cXR0Z2tzd3lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2NTY1MDgsImV4cCI6MjA5NjIzMjUwOH0.OLCglqT0sJBqPJmFaOBiaDZ_tOR8CPEsBqoXOJXWmP0'
);

async function main() {
  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, name, company, email, phone, status, value, priority, archived, obs, source, last_contact_at')
    .eq('archived', false)
    .limit(200);

  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  console.log('Total leads:', leads.length);
  const matches = leads.filter(l => 
    (l.name || '').toLowerCase().includes('gas') ||
    (l.name || '').toLowerCase().includes('fort') ||
    (l.company || '').toLowerCase().includes('gas') ||
    (l.company || '').toLowerCase().includes('fort') ||
    (l.obs || '').toLowerCase().includes('gas') ||
    (l.obs || '').toLowerCase().includes('fort') ||
    (l.email || '').toLowerCase().includes('gas') ||
    (l.phone || '').toLowerCase().includes('gas')
  );
  console.log('\nMatches:', JSON.stringify(matches, null, 2));
}

main();
