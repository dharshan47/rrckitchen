import { PolicyFooter } from "@/components/policy";

export default function PolicyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main>{children}</main>
      <PolicyFooter />
    </>
  );
}
