import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";


export const showSubsidyDialog = atomWithStorage<boolean>("showSubsidyDialog", false);
export const SubsidyValue = atom<number>(0);
export const UsedSubsidy = atom<number>(0);
export const SearchqueryAtom = atom<string>("");