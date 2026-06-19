import ImmigrationSidebar from "@/components/immigation/immigrationSlidebar";

export default function ImmigrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ImmigrationSidebar />
      <main className="md:pl-64 pt-14 md:pt-0">{children}</main>
    </>
  );
}
