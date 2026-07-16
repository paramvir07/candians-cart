import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import Navbar from "@/components/customer/landing/Navbar";
import WalletSwitcher from "@/components/customer/wallet/WalletSwitcher";
import CustomerAdvertisements from "@/components/customer/shared/CustomerAdvertisements";
import WalletSkeleton from "@/components/skeletons/WalletSkeleton";
import WalletViewServer from "@/components/customer/wallet/server/WalletViewServer";

export const metadata = {
  title: "Wallet",
};

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-3 pb-10 pt-5 sm:px-5 md:px-8 md:pt-7">
        <section className="mx-auto w-full max-w-6xl">
          <Link
            href="/customer"
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="mb-5 text-center sm:mb-6 sm:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              My Wallets
            </h1>

            <p className="mt-1 text-sm text-slate-500 sm:text-base">
              Manage your wallet balance and transaction history.
            </p>
          </div>

          <WalletSwitcher />

          <Suspense fallback={<WalletSkeleton />}>
            <WalletViewServer />
          </Suspense>
        </section>

        <section
          aria-label="Featured advertisements"
          className="mx-auto mt-8 w-full max-w-5xl sm:mt-10"
        >
          <CustomerAdvertisements maxHeight={250} />
        </section>
      </main>
    </div>
  );
}
