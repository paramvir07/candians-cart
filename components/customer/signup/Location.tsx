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
    <>
      <p className="text-muted-foreground">
        First, please select your city to get started.
      </p>
      <div className="w-full max-w-sm space-y-4">
        <Select
          onValueChange={() => {
            setStep("terms");
          }}
        >
          <SelectTrigger className="text-base w-full cursor-pointer py-6">
            <div className="flex items-center justify-center gap-4">
              <MapPin />
              <SelectValue placeholder="Select your city" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="abbotsford">Abbotsford, BC</SelectItem>
            <div className="text-xs text-muted-foreground p-2">
              Will be reaching other cities soon
            </div>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default Location;
