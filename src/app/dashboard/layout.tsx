import AppNav from '@/components/AppNav'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-dark pt-14">
            <AppNav />
            <main className="w-full">
                <div className="mx-auto max-w-7xl p-6 sm:p-8">{children}</div>
            </main>
        </div>
    )
}
