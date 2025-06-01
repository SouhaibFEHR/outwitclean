import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wuvolnijnmlboeopqymx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dm9sbmlqbm1sYm9lb3BxeW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NTEwMzksImV4cCI6MjA2NDMyNzAzOX0.K2eH9548B1WDShLMjzoTFuY2DBkXLjKn8CTtPLUkq4g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);