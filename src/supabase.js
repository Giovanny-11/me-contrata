import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://meawlzbhskumcwtjutde.supabase.co';       // ex: https://xyzxyz.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lYXdsemJoc2t1bWN3dGp1dGRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNzQyMjksImV4cCI6MjA5MDk1MDIyOX0.vCvltzSEUoItxDJJnKPvkMVTKXaZxBHII3n9lZQbveg'; // começa com "eyJ..."

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
