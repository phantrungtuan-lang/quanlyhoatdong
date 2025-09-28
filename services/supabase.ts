
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://upymywzzjnypqnylhwoo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVweW15d3p6am55cHFueWxod29vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNjkwNjgsImV4cCI6MjA3NDY0NTA2OH0.R-n4cALRBpTBTl9M4kB20SLywwVa4jSpJ5S6NcagA0U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
  },
});
