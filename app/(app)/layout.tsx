import { BaselineGate } from "@/components/BaselineGate";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background">
      <BaselineGate />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#F4ECF8]/60 via-surface/40 to-white p-8">{children}</main>
      </div>
      <ChangePasswordModal />
    </div>
  );
}
