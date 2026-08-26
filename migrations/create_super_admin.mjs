// Creates the super-admin auth user + admins row via the Supabase Admin API.
// Usage: node create_super_admin.mjs <email> <password> <name>
const PROJECT = "grfajbnfzdwgxpxcdpsc";
const SERVICE_KEY = process.env.SB_SERVICE_KEY;
const [email, password, name] = process.argv.slice(2);

if (!SERVICE_KEY) { console.error("Missing SB_SERVICE_KEY"); process.exit(1); }
if (!email || !password || !name) {
  console.error("Usage: node create_super_admin.mjs <email> <password> <name>");
  process.exit(1);
}

const base = `https://${PROJECT}.supabase.co`;
const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

// 1. Create auth user (auto-confirmed)
const createRes = await fetch(`${base}/auth/v1/admin/users`, {
  method: "POST",
  headers,
  body: JSON.stringify({ email, password, email_confirm: true }),
});
const createJson = await createRes.json();
if (!createRes.ok) {
  console.error("Create user failed:", JSON.stringify(createJson));
  process.exit(1);
}
const uid = createJson.id;
console.log("Auth user created:", uid);

// 2. Insert admin row (service key bypasses RLS)
const insRes = await fetch(`${base}/rest/v1/admins`, {
  method: "POST",
  headers: { ...headers, Prefer: "return=representation" },
  body: JSON.stringify({ id: uid, name, role: "super" }),
});
const insJson = await insRes.json();
if (!insRes.ok) {
  console.error("Insert admin row failed:", JSON.stringify(insJson));
  process.exit(1);
}
console.log("Super-admin row created:", JSON.stringify(insJson));
