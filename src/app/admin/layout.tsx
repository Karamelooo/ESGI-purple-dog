
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
        redirect('/');
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
            <AdminSidebar userEmail={session.user.email || "Admin"} />

            {/* Main Content */}
            <main className="flex-1 overflow-auto w-full">
                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
