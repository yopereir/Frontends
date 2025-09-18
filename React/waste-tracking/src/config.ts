if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  alert("VITE_SUPABASE_ANON_KEY is required");
  throw new Error("VITE_SUPABASE_ANON_KEY is required");
}
if (!import.meta.env.VITE_SUPABASE_URL) {
  alert("VITE_SUPABASE_URL is required");
  throw new Error("VITE_SUPABASE_URL is required");
}
if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
  alert("VITE_STRIPE_PUBLISHABLE_KEY is required");
  throw new Error("VITE_STRIPE_PUBLISHABLE_KEY is required");
}
if (!import.meta.env.VITE_STRIPE_PRICING_TABLE_DARKTHEME) {
  alert("VITE_STRIPE_PRICING_TABLE_DARKTHEME is required");
  throw new Error("VITE_STRIPE_PRICING_TABLE_DARKTHEME is required");
}
if (!import.meta.env.VITE_STRIPE_PRICING_TABLE_LIGHTTHEME) {
  alert("VITE_STRIPE_PRICING_TABLE_LIGHTTHEME is required");
  throw new Error("VITE_STRIPE_PRICING_TABLE_LIGHTTHEME is required");
}

export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
export const STRIPE_PRICING_TABLE_DARKTHEME = import.meta.env.VITE_STRIPE_PRICING_TABLE_DARKTHEME;
export const STRIPE_PRICING_TABLE_LIGHTTHEME = import.meta.env.VITE_STRIPE_PRICING_TABLE_LIGHTTHEME;
