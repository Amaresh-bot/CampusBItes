"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Settings, CreditCard, FileText, LogOut, User, Wallet } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Profile {
    name: string;
    email: string;
    avatar: string;
    subscription?: string; // Role
    model?: string;        // Wallet balance
}

interface MenuItem {
    label: string;
    value?: string;
    onClick?: () => void;
    icon: React.ReactNode;
}

const SAMPLE_PROFILE_DATA: Profile = {
    name: "Eugene An",
    email: "eugene@kokonutui.com",
    avatar: "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/profile-mjss82WnWBRO86MHHGxvJ2TVZuyrDv.jpeg",
    subscription: "PRO",
    model: "Gemini 2.0 Flash",
};

interface ProfileDropdownProps extends React.HTMLAttributes<HTMLDivElement> {
    data?: Profile;
    showTopbar?: boolean;
    onProfileClick?: () => void;
    onSettingsClick?: () => void;
    onSignOutClick?: () => void;
    onWalletClick?: () => void;
    onOrdersClick?: () => void;
    className?: string;
}

export function ProfileDropdown({
    data = SAMPLE_PROFILE_DATA,
    className,
    onProfileClick,
    onSettingsClick,
    onSignOutClick,
    onWalletClick,
    onOrdersClick,
    ...props
}: ProfileDropdownProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    
    const menuItems: MenuItem[] = [
        {
            label: "Profile Setup",
            onClick: onProfileClick,
            icon: <User className="w-4 h-4 text-slate-500" />,
        },
        {
            label: "Wallet Balance",
            value: data.model,
            onClick: onWalletClick,
            icon: <Wallet className="w-4 h-4 text-emerald-600" />,
        },
        {
            label: "Role",
            value: data.subscription,
            onClick: onOrdersClick,
            icon: <CreditCard className="w-4 h-4 text-slate-500" />,
        },
    ];

    return (
        <div className={cn("relative", className)} {...props}>
            <DropdownMenu onOpenChange={setIsOpen}>
                <div className="group relative">
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="flex items-center gap-4 p-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 hover:shadow-sm transition-all duration-200 focus:outline-none cursor-pointer"
                        >
                            <div className="text-left flex-1 min-w-0 pr-2">
                                <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight truncate">
                                    {data.name}
                                </div>
                                <div className="text-[10px] text-zinc-500 dark:text-zinc-400 tracking-tight leading-tight truncate">
                                    {data.email}
                                </div>
                            </div>
                            <div className="relative flex-shrink-0">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1B4D3E] via-[#2E7D5A] to-emerald-400 p-0.5">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-zinc-900">
                                        <img
                                            src={data.avatar}
                                            alt={data.name}
                                            width={32}
                                            height={32}
                                            className="w-full h-full object-cover rounded-full"
                                            onError={(e) => {
                                                e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}`;
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </button>
                    </DropdownMenuTrigger>

                    {/* Bending line indicator on the right */}
                    <div
                        className={cn(
                            "absolute -right-3 top-1/2 -translate-y-1/2 transition-all duration-200",
                            isOpen
                                ? "opacity-100"
                                : "opacity-60 group-hover:opacity-100"
                        )}
                    >
                        <svg
                            width="12"
                            height="24"
                            viewBox="0 0 12 24"
                            fill="none"
                            className={cn(
                                "transition-all duration-200",
                                isOpen
                                    ? "text-[#1B4D3E] dark:text-[#2E7D5A] scale-110"
                                    : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                            )}
                            aria-hidden="true"
                        >
                            <path
                                d="M2 4C6 8 6 16 2 20"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                fill="none"
                            />
                        </svg>
                    </div>

                    <DropdownMenuContent
                        align="end"
                        sideOffset={4}
                        className="w-60 p-2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl shadow-xl shadow-zinc-900/5 dark:shadow-zinc-950/20 
                    data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-top-right z-50"
                    >
                        <div className="space-y-1">
                            {menuItems.map((item) => (
                                <DropdownMenuItem key={item.label} asChild>
                                    <button
                                        type="button"
                                        onClick={item.onClick}
                                        className="w-full flex items-center p-2.5 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 rounded-xl transition-all duration-200 cursor-pointer group hover:shadow-sm border border-transparent hover:border-zinc-200/50 dark:hover:border-zinc-700/50 text-left"
                                    >
                                        <div className="flex items-center gap-2 flex-1">
                                            {item.icon}
                                            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 tracking-tight leading-tight whitespace-nowrap group-hover:text-zinc-950 dark:group-hover:text-zinc-50 transition-colors">
                                                {item.label}
                                            </span>
                                        </div>
                                        <div className="flex-shrink-0 ml-auto">
                                            {item.value && (
                                                <span
                                                    className={cn(
                                                        "text-[10px] font-bold rounded-md py-0.5 px-1.5 tracking-tight",
                                                        item.label === "Wallet Balance"
                                                            ? "text-emerald-700 bg-emerald-50 border border-emerald-500/10"
                                                            : "text-[#1B4D3E] bg-green-50 border border-green-500/10"
                                                    )}
                                                >
                                                    {item.value}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                </DropdownMenuItem>
                            ))}
                        </div>

                        <DropdownMenuSeparator className="my-2 bg-gradient-to-r from-transparent via-zinc-200 to-transparent dark:via-zinc-800" />

                        <DropdownMenuItem asChild>
                            <button
                                type="button"
                                onClick={onSignOutClick}
                                className="w-full flex items-center gap-3 p-2.5 duration-200 bg-red-500/10 rounded-xl hover:bg-red-500/20 cursor-pointer border border-transparent hover:border-red-500/30 hover:shadow-sm transition-all group text-left"
                            >
                                <LogOut className="w-4 h-4 text-red-500 group-hover:text-red-600" />
                                <span className="text-xs font-bold text-red-500 group-hover:text-red-600">
                                    Sign Out
                                </span>
                            </button>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </div>
            </DropdownMenu>
        </div>
    );
}
