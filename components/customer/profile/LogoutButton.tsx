"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth/login-logout.actions";

type Props = {
  variant?: "row" | "card";
};

export default function LogoutButton({ variant = "card" }: Props) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await logoutAction();
  };

  if (variant === "row") {
    return (
      <button
        onClick={handleLogout}
        disabled={loading}
        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-rose-500/5 transition-colors group disabled:opacity-50 text-left"
      >
        <span className="text-lg shrink-0">🚪</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-rose-500 group-hover:text-rose-600 transition-colors">
            {loading ? "Signing out…" : "Sign Out"}
          </p>
          <p className="text-xs text-muted-foreground">Log out of your account</p>
        </div>
        <LogOut className="h-4 w-4 text-rose-400/50 group-hover:text-rose-500 transition-colors shrink-0" />
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-rose-200/50 dark:border-rose-900/30 bg-card overflow-hidden">
      <button
        onClick={handleLogout}
        disabled={loading}
        className="w-full flex items-center gap-3 px-4 py-4 hover:bg-rose-500/5 transition-colors group disabled:opacity-50"
      >
        <div className="shrink-0 w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all duration-200">
          <LogOut className="h-4 w-4" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-semibold text-rose-500 group-hover:text-rose-600 transition-colors leading-none">
            {loading ? "Signing out…" : "Sign Out"}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            You&apos;ll be returned to the login screen
          </p>
        </div>
        <LogOut className="h-4 w-4 text-rose-300/50 group-hover:text-rose-400 transition-colors shrink-0" />
      </button>
    </div>
  );
}