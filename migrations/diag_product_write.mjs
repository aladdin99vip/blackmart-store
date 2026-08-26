// Diagnose: can the super-admin actually write products through RLS?
const BASE = "https://grfajbnfzdwgxpxcdpsc.supabase.co";
const PUB = "sb_publishable_z-4IJevaYZ_STKZvgTRkYQ_PFimnjFz";
const j = (r) => r.json();

// 1. Log in as super-admin
const loginRes = await fetch(`${BASE}/auth/v1/token?grant_type=password`, {
  method: "POST",
  headers: { apikey: PUB, "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "aladdin99vip@gmail.com",
    password: "alvinster12345",
  }),
});
const login = await j(loginRes);
if (!login.access_token) {
  console.log("LOGIN FAILED:", JSON.stringify(login).slice(0, 200));
  process.exit(1);
}
const token = login.access_token;
const uid = login.user.id;
console.log("1. Super-admin login OK, uid:", uid);

const authH = {
  apikey: PUB,
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

// 2. Check is_admin() via RPC as this user
const isAdminRes = await fetch(`${BASE}/rest/v1/rpc/is_admin`, {
  method: "POST",
  headers: authH,
  body: "{}",
});
console.log("2. is_admin() =>", isAdminRes.status, await isAdminRes.text());

// 3. Try to INSERT a product (this is what the admin panel does)
const insRes = await fetch(`${BASE}/rest/v1/products`, {
  method: "POST",
  headers: { ...authH, Prefer: "return=representation" },
  body: JSON.stringify({
    name: "DIAG_TEST",
    price: 1,
    description: "diag",
    image: "/images/product1.jpg",
    stock: 5,
  }),
});
console.log("3. INSERT product =>", insRes.status, (await insRes.text()).slice(0, 300));

// 4. Try to UPDATE an existing product
const updRes = await fetch(`${BASE}/rest/v1/products?id=eq.2`, {
  method: "PATCH",
  headers: { ...authH, Prefer: "return=representation" },
  body: JSON.stringify({ name: "Product 1" }),
});
console.log("4. UPDATE product =>", updRes.status, (await updRes.text()).slice(0, 300));
