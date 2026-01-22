import { Outlet } from 'react-router-dom';

export default function MobileLayout() {
    return (
        <div className="min-h-screen bg-primary-50 flex justify-center">
            <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col overflow-hidden">
                <main className="flex-1 flex flex-col">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
