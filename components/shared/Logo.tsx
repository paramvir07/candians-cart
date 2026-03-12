import { ShoppingCart } from "lucide-react";
import Link from "next/link";

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="bg-green-600 p-2 rounded">
        <ShoppingCart
          style={{ width: `24px`, height: `24px` }}
          className="text-white"
        />
      </div>
    </Link>
  );
};

export default Logo;
