"use client";

import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-card-bg p-8 shadow-lg border border-card-border">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white font-bold text-2xl">
            SM
          </div>
          <h1 className="mt-4 text-2xl font-bold text-foreground">
            Staff Manager
          </h1>
          <p className="mt-2 text-sm text-muted">
            アルバイト・インターン生 管理システム
          </p>
        </div>

        <button
          onClick={handleLogin}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          <LogIn size={20} />
          Google アカウントでログイン
        </button>

        <p className="text-center text-xs text-muted">
          Supabase 接続後、Google OAuth が有効になります
        </p>
      </div>
    </div>
  );
}
