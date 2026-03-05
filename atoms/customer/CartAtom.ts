import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";


export const showSubsidyDialog = atomWithStorage<boolean>("showSubsidyDialog", false);
export const SubsidyValue = atom<number>(0);