"use client"

import { UsedSubsidy } from "@/atoms/customer/CartAtom";
import { useAtom } from "jotai";

const GetUsedSubsidy = ({usedSubsidy}:{usedSubsidy:number}) => {

  const [usedSub,setUsedSub] = useAtom(UsedSubsidy);

  if(!usedSubsidy){
    return null
  }else{
    setUsedSub(usedSubsidy)
  }

  return (
    null
  )
}

export default GetUsedSubsidy