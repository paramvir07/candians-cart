import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { History, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { WalletHistoryLoader } from "@/components/customer/wallet/WallethistoryLoader";
import { WalletHistorySkeleton } from "@/components/skeletons/WallethistorySkeleton";
import Navbar from "@/components/customer/landing/Navbar";

const WalletHistoryPage = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pt-6 pb-4">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/customer/wallet">
                <Button className="rounded-full" variant="outline" size="icon">
                  <ChevronLeft size={25} />
                </Button>
              </Link>
              <History size={28} className="text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">
                Wallet top up history
              </h1>
            </div>
          </div>

          <Suspense fallback={<WalletHistorySkeleton />}>
            <WalletHistoryLoader />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default WalletHistoryPage;