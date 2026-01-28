import { NavLink } from 'react-router-dom';
import { Map, List, MessageSquare, User } from 'lucide-react';
import { clsx } from 'clsx';

export function BottomNav() {
    return (
        <nav
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-primary-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-[500] flex justify-around p-2"
            style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
        >
            <NavLink
                to="/home"
                className={({ isActive }) => clsx(
                    "flex flex-col items-center justify-center p-2 rounded-lg w-20 transition-colors",
                    isActive ? "text-accent-600 bg-accent-50" : "text-primary-400 hover:text-primary-600"
                )}
            >
                <Map size={24} />
                <span className="text-xs font-medium mt-1">Mapa</span>
            </NavLink>

            <NavLink
                to="/feed"
                className={({ isActive }) => clsx(
                    "flex flex-col items-center justify-center p-2 rounded-lg w-20 transition-colors",
                    isActive ? "text-accent-600 bg-accent-50" : "text-primary-400 hover:text-primary-600"
                )}
            >
                <List size={24} />
                <span className="text-xs font-medium mt-1">Feed</span>
            </NavLink>

            <NavLink
                to="/emergency"
                className={({ isActive }) => clsx(
                    "flex flex-col items-center justify-center p-2 rounded-lg w-20 transition-colors",
                    isActive ? "text-red-600 bg-red-50" : "text-primary-400 hover:text-red-500"
                )}
            >
                <div className="bg-red-100 p-1.5 rounded-full mb-0.5">
                    <div className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-[10px] shadow-sm">SOS</div>
                </div>
                <span className="text-[10px] font-bold mt-0.5 text-red-600">SOS</span>
            </NavLink>

            <NavLink
                to="/community"
                className={({ isActive }) => clsx(
                    "flex flex-col items-center justify-center p-2 rounded-lg w-20 transition-colors",
                    isActive ? "text-accent-600 bg-accent-50" : "text-primary-400 hover:text-primary-600"
                )}
            >
                <MessageSquare size={24} />
                <span className="text-xs font-medium mt-1">Chat</span>
            </NavLink>

            <NavLink
                to="/profile"
                className={({ isActive }) => clsx(
                    "flex flex-col items-center justify-center p-2 rounded-lg w-20 transition-colors",
                    isActive ? "text-accent-600 bg-accent-50" : "text-primary-400 hover:text-primary-600"
                )}
            >
                <User size={24} />
                <span className="text-xs font-medium mt-1">Perfil</span>
            </NavLink>
        </nav>
    );
}
