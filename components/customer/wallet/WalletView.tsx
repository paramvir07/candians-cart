'use client'
import { useAtom } from 'jotai'
import GiftWallet from './GiftWallet'
import TopupWallet from './TopupWallet'
import { WalletSwitcherAtom, WalletViewEnum } from '@/atoms/customer/Wallet'
import { Separator } from '@/components/ui/separator'


const WalletView = () => {
    const [activeWallet] = useAtom(WalletSwitcherAtom);
  return (
    <div>
      <div className='md:hidden'>
        {activeWallet === WalletViewEnum.WALLET ? <TopupWallet/> : <GiftWallet/>}
      </div>

        <div className='w-full justify-center p-8 hidden md:flex'>
          <div className='flex-1'>
          <TopupWallet/>
          </div>
          <Separator orientation='vertical' className='mx-8'/>
          <div className='flex-1'>
          <GiftWallet/>
          </div>
        </div>
    </div>
  )
}

export default WalletView