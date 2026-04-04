import { Step } from "@/types/customer/signUp";
import { StoreDetails } from "@/types/store/store";
import { atom } from "jotai";

export const stepAtom = atom<Step>("location");
export const budgetAtom = atom<string>("");
export const storeNameAtom = atom<string>("");
export const storeIdAtom = atom<string>("");
export const referralCodeAtom = atom<string>("");
export const isStoreSelectedDialogOpenAtom = atom<boolean>(false);
export const selectedStoreInfoAtom = atom<StoreDetails | null>(null);
export const storeAddressAtom = atom<string>("");
export const pendingStoreAddressAtom = atom<string>("")
export const pendingStoreIdAtom = atom<string>("")