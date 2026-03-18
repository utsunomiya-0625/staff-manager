import { NextResponse } from "next/server";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "未認証です" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
    }

    const { email, role = "staff", name = "" } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "メールアドレスが必要です" }, { status: 400 });
    }

    const adminSupabase = createAdminSupabase();

    const { data, error } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
      data: { full_name: name, role },
    });

    if (error) {
      return NextResponse.json({
        error: error.message,
        hint: "Supabase ダッシュボード → Authentication → Settings で招待メール機能が有効か確認してください",
      }, { status: 400 });
    }

    if (data.user) {
      await adminSupabase
        .from("profiles")
        .upsert({
          id: data.user.id,
          email,
          name,
          role,
          hourly_rate: 1200,
        });
    }

    return NextResponse.json({
      success: true,
      message: `${email} に招待メールを送信しました`,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "招待に失敗しました";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
