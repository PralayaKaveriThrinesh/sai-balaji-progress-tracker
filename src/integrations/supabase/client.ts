
// This is now a mock implementation that doesn't connect to Supabase
// Instead, it uses localStorage for data persistence

// Mock client for local storage operations
const createMockClient = () => {
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => {
        return { 
          subscription: { 
            unsubscribe: () => {} 
          } 
        };
      }
    },
    from: (table: string) => {
      return {
        select: () => {
          console.log(`Mock select from ${table}`);
          return {
            eq: () => ({
              single: () => Promise.resolve({ data: null, error: null }),
              maybeSingle: () => Promise.resolve({ data: null, error: null }),
            }),
            order: () => ({
              limit: () => Promise.resolve({ data: [], error: null }),
            }),
            match: () => Promise.resolve({ data: [], error: null }),
          };
        },
        insert: (data: any) => {
          console.log(`Mock insert to ${table}`, data);
          return Promise.resolve({ data, error: null });
        },
        update: (data: any) => {
          console.log(`Mock update to ${table}`, data);
          return {
            eq: () => Promise.resolve({ data, error: null }),
            match: () => Promise.resolve({ data, error: null }),
          };
        },
        delete: () => {
          return {
            eq: () => Promise.resolve({ data: null, error: null }),
            match: () => Promise.resolve({ data: null, error: null }),
          };
        },
      };
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: { path: 'mock-path' }, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'mock-url' } }),
      }),
    },
  };
};

export const supabase = createMockClient();

export const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};
