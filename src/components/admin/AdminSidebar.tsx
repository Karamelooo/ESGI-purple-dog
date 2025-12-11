'use client'

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Tags,
    Settings,
    Package,
    FileText,
    Truck,
    CreditCard,
    Menu,
    X,
    LogOut
} from "lucide-react";

const navigation = [
    { name: 'Tableau de bord', href: '/admin', icon: LayoutDashboard },
    { name: 'Utilisateurs', href: '/admin/users', icon: Users },
    { name: 'Catégories', href: '/admin/categories', icon: Tags },
    { name: 'Annonces', href: '/admin/ads', icon: Package },
    { name: 'Avis', href: '/admin/reviews', icon: FileText },
    { name: 'Comptabilité', href: '/admin/accounting', icon: CreditCard },
    { name: 'Livraisons', href: '/admin/delivery', icon: Truck },
    { name: 'Paramètres', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar({ userEmail }: { userEmail: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-20">
                <span className="font-bold text-gray-800">Admin Panel</span>
                <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-600">
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Sidebar Overlay (Mobile) */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <div className={`
                fixed inset-y-0 left-0 transform bg-white shadow-lg w-64 z-40 transition-transform duration-200 ease-in-out
                md:translate-x-0 md:static md:shadow-none
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b">
                        <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
                    </div>

                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`
                                        flex items-center px-4 py-3 rounded-lg transition-colors group
                                        ${isActive
                                            ? 'bg-primary/10 text-primary font-semibold'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-primary'}`} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </>
    );
}
