"use client";
import { MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { useSetAtom } from "jotai";
import { stepAtom } from "@/atoms/customer/signUp";

const Location = () => {
  const setStep = useSetAtom(stepAtom);

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-2">
          <MapPin className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold">Where are you located?</h2>
        <p className="text-muted-foreground text-sm">
          Select your city to find available stores near you.
        </p>
      </div>

      <div className="w-full space-y-3">
        <Select onValueChange={() => setStep("terms")}>
          <SelectTrigger className="w-full h-11 text-sm cursor-pointer focus:border-primary transition-all">
            <div className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Select your city" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="abbotsford">
              <div className="flex items-center gap-2">
                <span>Abbotsford, BC</span>
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                  Available
                </span>
              </div>
            </SelectItem>
            <div className="px-3 py-2 text-xs text-muted-foreground border-t mt-1">
              🚀 More cities coming soon!
            </div>
          </SelectContent>
        </Select>

        {/* <p className="text-center text-xs text-muted-foreground">
          Don't see your city?{" "}
          <a
            href="#"
            className="text-primary hover:underline underline-offset-4 font-medium"
          >
            Request your city
          </a>
        </p> */}
      </div>
    </div>
  );
};

export default Location;
