import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://grfajbnfzdwgxpxcdpsc.supabase.co";
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_pub…njFz";

// Only a super-admin may create new admin accounts.
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify caller identity from their access token
    const caller = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const {
      data: { user },
      error: userErr,
    } = await caller.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Confirm caller is a super-admin
    const { data: callerAdmin } = await supabaseAdmin
      .from("admins")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!callerAdmin || callerAdmin.role !== "super") {
      return NextResponse.json(
        { error: "Only super-admins can create admin accounts" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, email, password, role } = body as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
    };

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "name, email, password, role are required" },
        { status: 400 }
      );
    }
    if (!["super", "inventory", "shipping"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Create the auth user (auto-confirmed)
    const { data: created, error: createErr } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
    if (createErr || !created.user) {
      return NextResponse.json(
        { error: createErr?.message || "Failed to create user" },
        { status: 400 }
      );
    }

    // Insert admin profile row
    const { error: insertErr } = await supabaseAdmin
      .from("admins")
      .insert([{ id: created.user.id, name, role }]);
    if (insertErr) {
      // rollback auth user if profile insert fails
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      return NextResponse.json({ error: insertErr.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, id: created.user.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
