'use client'

import { useState } from "react";
import { toggleBlockUser, updateUserRole } from "@/app/actions/admin-users";
import { Ban, CheckCircle } from "lucide-react";

export default function UserActions({ user }: { user: any }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleBlockToggle = async () => {
        setIsLoading(true);
        await toggleBlockUser(user.id, !user.isBlocked);
        setIsLoading(false);
    };

    const handleRoleChange = async (newRole: 'USER' | 'PRO' | 'ADMIN') => {
        setIsLoading(true);
        await updateUserRole(user.id, newRole);
        setIsLoading(false);
    };

    return (
        <div className="flex items-center gap-2 justify-end">
            <select
                disabled={isLoading}
                value={user.role}
                onChange={(e) => handleRoleChange(e.target.value as any)}
                className="text-xs border rounded p-1 bg-white h-8"
            >
                <option value="USER">Particulier</option>
                <option value="PRO">Professionnel</option>
                <option value="ADMIN">Admin</option>
            </select>

            <button
                onClick={handleBlockToggle}
                disabled={isLoading}
                className={`p-1 rounded hover:bg-gray-100 h-8 w-8 flex items-center justify-center ${user.isBlocked ? 'text-green-600' : 'text-red-600'}`}
                title={user.isBlocked ? "Débloquer" : "Bloquer"}
            >
                {user.isBlocked ? <CheckCircle size={16} /> : <Ban size={16} />}
            </button>
        </div>
    );
}
