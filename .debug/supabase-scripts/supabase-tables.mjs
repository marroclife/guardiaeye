import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jifjcajdzpwqttgkswyp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppZmpjYWpkenB3cXR0Z2tzd3lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2NTY1MDgsImV4cCI6MjA5NjIzMjUwOH0.OLCglqT0sJBqPJmFaOBiaDZ_tOR8CPEsBqoXOJXWmP0'
);

async function main() {
  // Get all tables
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public');

  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  console.log('Tables:', data.map(t => t.table_name));
}

main();
