import { atomWithStorage } from "jotai/utils";


export const showSubsidyDialog = atomWithStorage<boolean>("showSubsidyDialog", false);
export const SubsidyValue = atomWithStorage<number>("SubsidyValue", 0);