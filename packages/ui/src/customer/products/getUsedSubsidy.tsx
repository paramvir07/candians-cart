"use client"

import { UsedSubsidy } from "@/atoms/customer/CartAtom";
import { useAtom } from "jotai";
import { useEffect } from "react";

const GetUsedSubsidy = ({ usedSubsidy, subItemslength }: { usedSubsidy: number, subItemslength: number }) => {
  const [, setUsedSub] = useAtom(UsedSubsidy);

  useEffect(() => {
    if (subItemslength <= 0) {
      setUsedSub(0);
    } else if (usedSubsidy) {
      setUsedSub(usedSubsidy);
    }
  }, [usedSubsidy, subItemslength]);

  return null;
}

export default GetUsedSubsidy;