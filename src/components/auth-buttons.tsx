import { signIn, signOut } from "@/auth";

export function SignInButton() {
    return (
        <form
            action={async () => {
                "use server";
                await signIn();
            }}
        >
            <button className="text-gray-800 font-medium hover:text-primary transition-colors">Se connecter</button>
        </form>
    );
}

export function SignOutButton() {
    return (
        <form
            action={async () => {
                "use server";
                await signOut();
            }}
        >
            <button className="text-gray-600 font-medium hover:text-red-600 transition-colors">Déconnexion</button>
        </form>
    );
}
