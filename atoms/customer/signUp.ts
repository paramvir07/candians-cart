import { Step } from "@/types/customer/signUp";
import { StoreDetails } from "@/types/store";
import { atom } from "jotai";
import { Types } from "mongoose";

export const stepAtom = atom<Step>("location");
export const budgetAtom = atom<string>("");
export const storeNameAtom = atom<string>("");
export const storeIdAtom = atom<Types.ObjectId>();
export const referralCodeAtom = atom<string>("");
export const isStoreSelectedDialogOpenAtom = atom<boolean>(false);
export const selectedStoreInfoAtom = atom<StoreDetails | null>(null);