import Banner from "@/components/customer/landing/Banner"
import Navbar from "@/components/customer/landing/Navbar"

const page = async() => {

  return (
    <div>
      <Navbar/>
      <div className="p-4 hidden md:block">
        <Banner/>
      </div>
    </div>
  )
}

export default page