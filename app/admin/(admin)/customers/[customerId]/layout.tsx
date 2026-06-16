import { TooltipProvider } from "@/components/ui/tooltip";

type Props = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: Props) {

  return (
    <>
      <TooltipProvider>
        <div className="flex-1 p-6 md:pl-20">{children}</div>
      </TooltipProvider>
    </>
  );
}
