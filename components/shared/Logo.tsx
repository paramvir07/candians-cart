import Link from "next/link";

type LogoProps = {
  variant?: "icon" | "full";
  href?: string;
};

export const Logo = ({ variant = "icon", href = "/customer" }: LogoProps) => {
  const src =
    variant === "full"
      ? "https://ik.imagekit.io/h7w5h0hou/Candian's-Cart-Logo.png"
      : "https://ik.imagekit.io/h7w5h0hou/Candian's-Cart-Logo-abb.png";

  return (
    <Link href={href} className="flex items-center">
      <img
        src={src}
        alt="Logo"
        className={`object-contain ${
          variant === "full" ? "h-10 sm:h-12" : "h-10"
        } w-auto`}
      />
    </Link>
  );
};

export default Logo;