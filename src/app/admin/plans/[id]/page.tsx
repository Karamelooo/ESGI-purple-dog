import prisma from '@/lib/prisma'
import EditPlanForm from './form'

export default async function PlanEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    let plan = {}

    if (id !== 'new') {
        const existingPlan = await prisma.subscriptionPlan.findUnique({
            where: { id: parseInt(id) }
        })
        if (existingPlan) {
            plan = existingPlan
        }
    }

    return (
        <div className="container mx-auto py-10">
            <EditPlanForm plan={plan} />
        </div>
    )
}
