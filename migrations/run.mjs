import { readFileSync } from "node:fs";

const TOKEN = process.env.SB_TOKEN;
const PROJECT = "grfajbnfzdwgxpxcdpsc";
const sqlFile = process.argv[2];

if (!TOKEN) { console.error("Missing SB_TOKEN env"); process.exit(1); }
if (!sqlFile) { console.error("Usage: node run.mjs <sqlfile>"); process.exit(1); }

const query = readFileSync(sqlFile, "utf8");

const res = await fetch(
  `https://api.supabase.com/v1/projects/${PROJECT}/database/query`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  }
);

const text = await res.text();
console.log("HTTP", res.status);
console.log(text);
if (!res.ok) process.exit(1);
