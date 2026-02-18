'use client'
import { useAtom } from 'jotai'
import GiftWallet from './GiftWallet'
import TopupWallet from './TopupWallet'
import { WalletSwitcherAtom, WalletViewEnum } from '@/atoms/customer/Wallet'


const WalletView = () => {
    const [activeWallet] = useAtom(WalletSwitcherAtom);
  return (
    <div>
        {activeWallet === WalletViewEnum.WALLET ? <TopupWallet/> : <GiftWallet/>}
    </div>
  )
}

export default WalletView