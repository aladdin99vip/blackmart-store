// Why does is_admin() return false for the logged-in super-admin?
const BASE = "https://grfajbnfzdwgxpxcdpsc.supabase.co";
const PUB = "sb_publishable_z-4IJevaYZ_STKZvgTRkYQ_PFimnjFz";
const j = (r) => r.json();

const loginRes = await fetch(`${BASE}/auth/v1/token?grant_type=password`, {
  method: "POST",
  headers: { apikey: PUB, "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "aladdin99vip@gmail.com",
    password: "alvinster12345",
  }),
});
const login = await j(loginRes);
const token = login.access_token;
const uid = login.user.id;
console.log("Logged in uid:", uid);

const authH = {
  apikey: PUB,
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

// A. Can the logged-in user SELECT their own admin row? (admins RLS test)
const meRes = await fetch(
  `${BASE}/rest/v1/admins?select=id,name,role`,
  { headers: authH }
);
console.log("A. admins visible to me:", meRes.status, await meRes.text());

// B. What does auth.uid() resolve to inside a query? Use a tiny rpc-free check:
// select the admin row filtered by id = uid
const byIdRes = await fetch(
  `${BASE}/rest/v1/admins?id=eq.${uid}&select=id,role`,
  { headers: authH }
);
console.log("B. my admin row by id:", byIdRes.status, await byIdRes.text());
