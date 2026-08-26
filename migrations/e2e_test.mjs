// End-to-end order test against production Supabase.
const BASE = "https://grfajbnfzdwgxpxcdpsc.supabase.co";
const PUB = "sb_publishable_z-4IJevaYZ_STKZvgTRkYQ_PFimnjFz";

const j = (r) => r.json();

// 1. Log in as the test customer
const loginRes = await fetch(`${BASE}/auth/v1/token?grant_type=password`, {
  method: "POST",
  headers: { apikey: PUB, "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "testcustomer@example.com",
    password: "testpass123",
  }),
});
const login = await j(loginRes);
if (!login.access_token) {
  console.log("LOGIN FAILED:", JSON.stringify(login).slice(0, 200));
  process.exit(1);
}
const token = login.access_token;
const uid = login.user.id;
console.log("1. Login OK, uid:", uid);

const authH = {
  apikey: PUB,
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

// 2. Insert customer profile (RLS: auth.uid() = id)
const profRes = await fetch(`${BASE}/rest/v1/customers`, {
  method: "POST",
  headers: { ...authH, Prefer: "return=representation" },
  body: JSON.stringify({ id: uid, name: "Test Customer", phone: "+60123456789" }),
});
console.log("2. Profile insert HTTP:", profRes.status);

// 3. Read a product + its stock before
const beforeRes = await fetch(
  `${BASE}/rest/v1/products?id=eq.2&select=id,name,stock`,
  { headers: authH }
);
const before = (await j(beforeRes))[0];
console.log("3. Product before:", JSON.stringify(before));

// 4. Decrement stock via RPC (qty 3)
const decRes = await fetch(`${BASE}/rest/v1/rpc/decrement_stock`, {
  method: "POST",
  headers: authH,
  body: JSON.stringify({ p_id: 2, p_qty: 3 }),
});
const newStock = await j(decRes);
console.log("4. decrement_stock returned new stock:", newStock);

// 5. Place an order
const orderRes = await fetch(`${BASE}/rest/v1/orders`, {
  method: "POST",
  headers: { ...authH, Prefer: "return=representation" },
  body: JSON.stringify({
    customer_id: uid,
    customer_name: "Test Customer",
    customer_phone: "+60123456789",
    address: "123 Test Street, Kuala Lumpur, 50000",
    items: [{ id: "2", name: before.name, price: 5, quantity: 3 }],
    total: 15,
  }),
});
const order = await j(orderRes);
console.log("5. Order placed HTTP:", orderRes.status, "id:", order[0]?.id);

// 6. Customer reads own orders
const myOrdersRes = await fetch(
  `${BASE}/rest/v1/orders?select=id,total,status`,
  { headers: authH }
);
const myOrders = await j(myOrdersRes);
console.log("6. Customer sees", myOrders.length, "own order(s)");

console.log("\nE2E TEST COMPLETE");
