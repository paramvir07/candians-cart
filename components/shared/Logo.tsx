import { ShoppingCart } from "lucide-react";
import Link from "next/link";



const Logo = () => {
  return (
    <Link href={"/customer"} className="flex items-center gap-2">
      <div className="bg-green-600 p-2 rounded">
        <ShoppingCart
          style={{ width: `24px`, height: `24px` }}
          className="text-white"
        />
      </div>
      <h1 className="text-md font-bold ">Candian&apos;s Cart</h1>
    </Link>
  );
};

export default Logo;
