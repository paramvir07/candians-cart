import Link from "next/link";

type LogoProps = {
  variant?: "icon" | "full";
};

export const Logo = ({ variant = "icon" }: LogoProps) => {
  const src =
    variant === "full"
      ? "/CC-Logo_full.png"
      : "/CC-Logo_cropped_icon.png";

  return (
    <Link href="/" className="flex items-center">
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