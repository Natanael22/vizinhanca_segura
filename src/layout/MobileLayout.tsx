import { Outlet } from 'react-router-dom';

export default function MobileLayout() {
    return (
        <div className="h-[100dvh] bg-primary-50 flex justify-center">
            <div className="w-full max-w-md bg-white h-full shadow-2xl relative flex flex-col">
                <main className="flex-1 flex flex-col">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
