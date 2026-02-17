"use client";
import { Card } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import SelectCity from "./SelectCity";
import Agreement from "./Agreement";
import { useAtom } from "jotai";
import { agreementCompAtom } from "@/atoms/customer/home";

const Hero = () => {
  const [agreementComp] = useAtom(agreementCompAtom);
  return (
    <div className="flex flex-col h-screen w-screen justify-center items-center">
      <Card className={`${agreementComp ? "p-10" : "py-25 px-10"} shadow-2xl`}>
        <div className="flex flex-col justify-center items-center gap-4 w-full max-w-70">
          <div className="flex justify-center bg-primary p-4 rounded-full">
            <ShoppingCart size={50} className="text-background" />
          </div>
          <div className="flex flex-col justify-center items-center">
            <div className="text-4xl font-bold">Welcome to</div>
            <div className="text-4xl text-primary text-center font-extrabold">
              Canadian's Cart
            </div>
          </div>
          <div className="text-muted-foreground text-sm text-center font-bold">
            The exclusive family-only grocery delivery platform.
          </div>
          {agreementComp ? <Agreement /> : <SelectCity />}
        </div>
      </Card>
    </div>
  );
};

export default Hero;
