import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jifjcajdzpwqttgkswyp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppZmpjYWpkenB3cXR0Z2tzd3lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2NTY1MDgsImV4cCI6MjA5NjIzMjUwOH0.OLCglqT0sJBqPJmFaOBiaDZ_tOR8CPEsBqoXOJXWmP0'
);

const tables = ['leads', 'lead_events', 'projects', 'temple_projects', 'domain_events', 'presence_sessions', 'payments', 'invoices', 'transactions', 'finance', 'financial', 'receivables', 'accounts_receivable'];

async function main() {
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        console.log(`❌ ${table}: não existe`);
      } else {
        console.log(`⚠️  ${table}: ${error.message}`);
      }
    } else {
      console.log(`✅ ${table}: existe (${JSON.stringify(data).slice(0, 100)}...)`);
    }
  }
}

main();
