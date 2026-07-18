"use client";AbortController
import Lottie from "lottie-react";
import emptyCartAnimation from "@canadian-cart/ui/assets/emptyCart.json";

export const AnimatedEmptyCart = () => {
  return (
          <Lottie
            animationData={emptyCartAnimation}
            loop
            autoplay
            className="w-78 h-78"
          />
  );
};