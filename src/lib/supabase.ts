import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://jhamqyuazxhzpapklqsb.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_jhJbDydEuDEO2ZoR07BfLg_fw7uM3C3';

// Retrieve credentials from env or browser localStorage (allows admin to configure Supabase live from UI)
const getCredentials = () => {
  const customUrl = localStorage.getItem('GALA_SUPABASE_URL');
  const customKey = localStorage.getItem('GALA_SUPABASE_KEY');
  
  const url = customUrl || import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = customKey || import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;

  return { url, key };
};

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key } = getCredentials();
  
  if (!url || !key) {
    return null;
  }

  if (!clientInstance) {
    try {
      clientInstance = createClient(url, key);
    } catch (e) {
      console.warn('Error al inicializar cliente de Supabase:', e);
      return null;
    }
  }

  return clientInstance;
};

export const setCustomSupabaseCredentials = (url: string, key: string) => {
  if (url && key) {
    localStorage.setItem('GALA_SUPABASE_URL', url.trim());
    localStorage.setItem('GALA_SUPABASE_KEY', key.trim());
    clientInstance = createClient(url.trim(), key.trim());
    return true;
  } else {
    localStorage.removeItem('GALA_SUPABASE_URL');
    localStorage.removeItem('GALA_SUPABASE_KEY');
    clientInstance = null;
    return false;
  }
};

export const getSavedSupabaseCredentials = () => {
  return getCredentials();
};
