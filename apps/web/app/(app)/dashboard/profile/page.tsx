import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  return (
    <div>
      <h1 className="text-[24px] font-semibold text-text-primary">Profile</h1>
      <p className="mt-1 text-[15px] text-text-secondary">{session?.user?.email}</p>
    </div>
  );
}
