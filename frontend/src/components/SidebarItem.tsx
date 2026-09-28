import type { ReactElement } from "react";

interface sidebarItemProps{
    text: string,
    icon: ReactElement,
    onclick?: () => void,
    active?: boolean,
    count?: number
}

export function SidebarItems(props: sidebarItemProps){
    return(
        <div 
            onClick={props.onclick} 
            className={`flex items-center justify-between py-2.5 cursor-pointer rounded-xl px-3.5 transition-all duration-200 ease-in-out border text-sm font-medium ${
                props.active 
                    ? "bg-[#2d4a31]/10 text-[#2d4a31] font-semibold border-[#2d4a31]/20 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/60 shadow-xs" 
                    : "text-stone-700 hover:bg-stone-100 hover:text-stone-900 border-transparent dark:text-stone-300 dark:hover:bg-[#142017] dark:hover:text-emerald-200"
            }`}
        >
            <div className="flex items-center gap-3.5 truncate">
                <div className="shrink-0 transition-transform duration-200">
                    {props.icon} 
                </div>
                <div className="truncate">
                    {props.text}
                </div>
            </div>

            {props.count !== undefined && props.count > 0 && (
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                    props.active
                        ? "bg-[#2d4a31]/20 text-[#2d4a31] dark:bg-emerald-900/60 dark:text-emerald-200"
                        : "bg-stone-200/60 text-stone-600 dark:bg-[#18261e] dark:text-stone-400"
                }`}>
                    {props.count}
                </span>
            )}
        </div>
    )
}