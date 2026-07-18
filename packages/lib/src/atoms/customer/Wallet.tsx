import { atom } from "jotai";

export enum WalletViewEnum {
    GIFT = "gift",
    WALLET = "wallet"
}
export const WalletSwitcherAtom = atom<WalletViewEnum>(WalletViewEnum.WALLET);