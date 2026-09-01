// ── CONEXÃO COM O SUPABASE ──
// Estas duas chaves são seguras de ficarem visíveis no navegador:
// a "anon key" só permite o que as políticas de segurança (RLS)
// liberarem no banco — no momento, apenas leitura do catálogo.
const SUPABASE_URL = "https://mxsotzisbluozssutyrx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14c290emlzYmx1b3pzc3V0eXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1OTg4MDQsImV4cCI6MjEwMzE3NDgwNH0.JIek0bxCz8SUS_qeANVKq_uWa5JTKL0Ylt7t_OH4zbg";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
