// src/app/dashboard/user/feedback/page.tsx
import FeedbackForm from "@/components/FeedbackForm";

export default function FeedbackPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 border-b pb-2">
                Avis sur la Plateforme
            </h1>
            <FeedbackForm />
        </div>
    );
}