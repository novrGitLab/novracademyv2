import { BaselineGate } from "@/components/BaselineGate";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";
import { ToastProvider } from "@/components/ui/toast-context";
import { ContentArea } from "./ContentArea";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex h-screen bg-background">
        <BaselineGate />
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopNav />
          <ContentArea>{children}</ContentArea>
        </div>
        <ChangePasswordModal />
      </div>
    </ToastProvider>
  );
}
