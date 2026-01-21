import type { ReactElement } from "react";

interface sidebarItemProps{
    text: string,
    icon: ReactElement
    onclick?: () => void
}

export function SidebarItems(props: sidebarItemProps){
    return(
        <div onClick={props.onclick} className="flex gap-4 text-gray-800 py-2 cursor-pointer rounded-md px-3 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 ease-in-out">
            <div className="group-hover:scale-110 transition-transform duration-200">
                {props.icon} 
            </div>
            <div>
                {props.text}
            </div>
        </div>
    )
}