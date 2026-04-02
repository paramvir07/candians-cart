"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth/login-logout.actions";
import { useRouter } from "next/navigation";

type Props = {
  variant?: "row" | "card";
};

export default function LogoutButton({ variant = "card" }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    const response = await logoutAction();
    if(response.success){
      router.push("/")
    }
  };

  if (variant === "row") {
    return (
      <button
        onClick={handleLogout}
        disabled={loading}
        className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-rose-500/8 transition-colors group disabled:opacity-50 text-left"
      >
        <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0 group-hover:bg-rose-500/15 transition-colors">
          <LogOut className="h-4 w-4 text-rose-500" strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-rose-500 leading-none">
            {loading ? "Signing out…" : "Sign Out"}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Log out of your account</p>
        </div>
        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 group-hover:bg-rose-500/10 transition-colors">
          <LogOut className="h-3 w-3 text-muted-foreground/40 group-hover:text-rose-400 transition-colors" />
        </div>
      </button>
    );
  }

  return (
    <div className="rounded-3xl border border-border/60 bg-card overflow-hidden">
      <button
        onClick={handleLogout}
        disabled={loading}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-rose-500/5 transition-colors group disabled:opacity-50 text-left"
      >
        <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0 group-hover:bg-rose-500/15 transition-colors">
          <LogOut className="h-4 w-4 text-rose-500" strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-rose-500 leading-none">
            {loading ? "Signing out…" : "Sign Out"}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            You&apos;ll be returned to the login screen
          </p>
        </div>
      </button>
    </div>
  );
}