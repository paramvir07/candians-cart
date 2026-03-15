import Link from "next/link";
import { Shield, Store, UserCog, ShoppingBag } from "lucide-react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";

const PORTAL_OPTIONS = [
  {
    href: "/admin/login",
    icon: Shield,
    label: "Admin Login",
    description: "Access the main dashboard to oversee all operations.",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    border: "border-blue-100",
    hoverBorder: "hover:border-blue-400",
    hoverBg: "hover:bg-blue-50/40",
    activeDot: "bg-blue-500",
  },
  {
    href: "/store/login",
    icon: Store,
    label: "Store Login",
    description: "Manage your grocery store, inventory, and promotions.",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    border: "border-emerald-100",
    hoverBorder: "hover:border-emerald-400",
    hoverBg: "hover:bg-emerald-50/40",
    activeDot: "bg-emerald-500",
  },
  {
    href: "/cashier/login",
    icon: UserCog,
    label: "Cashier Login",
    description: "Process customer orders and manage in-store transactions.",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    border: "border-amber-100",
    hoverBorder: "hover:border-amber-400",
    hoverBg: "hover:bg-amber-50/40",
    activeDot: "bg-amber-500",
  },
] as const;

export default async function PartnerAccessPortal() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) redirect("/");
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col items-center justify-center p-4">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-md">
          <ShoppingBag className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">
          Candian Cart
        </span>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl w-full max-w-lg p-8 sm:p-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Partner Access Portal
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Please select your login type to continue.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {PORTAL_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <Link
                key={option.href}
                href={option.href}
                className={`group relative flex items-center gap-4 p-4 rounded-2xl border ${option.border} ${option.hoverBorder} ${option.hoverBg} bg-white transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl ${option.iconBg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}
                >
                  <Icon className={`w-6 h-6 ${option.iconColor}`} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">
                    {option.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    {option.description}
                  </p>
                </div>

                {/* Arrow */}
                <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={option.iconColor}
                    />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-muted-foreground">
            Are you a customer?{" "}
            <Link
              href="/customer/login"
              className="text-primary hover:underline"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}