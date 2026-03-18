"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogIn, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch {
      setError("ログインに失敗しました。Supabase の設定を確認してください。");
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-card-bg p-8 shadow-lg border border-card-border">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white font-bold text-2xl">
            SM
          </div>
          <h1 className="mt-4 text-2xl font-bold text-foreground">Staff Manager</h1>
          <p className="mt-2 text-sm text-muted">アルバイト・インターン生 管理システム</p>
        </div>

        {error && (
          <div className="rounded-lg bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <LogIn size={20} />}
          Google アカウントでログイン
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-card-border" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-card-bg px-2 text-muted">または</span></div>
        </div>

        <button
          onClick={handleDemoLogin}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-card-border px-4 py-3 text-sm font-medium text-muted transition-colors hover:bg-background hover:text-foreground"
        >
          デモモードで体験する
        </button>

        <p className="text-center text-xs text-muted">
          Google ログインには Supabase プロジェクトの設定が必要です
        </p>
      </div>
    </div>
  );
}
