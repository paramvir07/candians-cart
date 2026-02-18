import Navbar from "@/components/customer/landing/Navbar"
import WalletSwitcher from "@/components/customer/wallet/WalletSwitcher"
import WalletView from "@/components/customer/wallet/WalletView"

const Page = () => {
  return (
    <div>
      <Navbar />
      <WalletSwitcher />
      <WalletView/>

    </div>
  )
}

export default Page