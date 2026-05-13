"use client";

import Lottie from "lottie-react";
import cartAnimation from "@/public/animations/cart.json";
// import { ShoppingCart } from "lucide-react";
import Logo from "@/components/shared/Logo";

const Loading = () => {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50 gap-2">

      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-4">
          <Logo variant="full" />

      </div>

      {/* Cart Lottie */}
      <Lottie
        animationData={cartAnimation}
        loop
        autoplay
        className="w-120 h-120"
      />

      {/* Pulsing dots */}
      <div className="flex items-center gap-2 mt-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-primary/50"
            style={{
              animation: "dotPulse 1.2s ease-in-out infinite",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); }
          40%            { opacity: 1;    transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Loading;