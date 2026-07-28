import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav />
        <main className="flex-1 overflow-y-auto bg-surface/40 p-8">{children}</main>
      </div>
    </div>
  );
}
