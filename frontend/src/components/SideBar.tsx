import { Link } from "react-router-dom";
import { BrainIcon } from "../icons/brainIcon";
import { LinkIcon } from "../icons/linkIcon";
import { NoteIcon } from "../icons/noteIcon";
import { TwitterIcon } from "../icons/twitterIcon";
import { YoutubeIcon } from "../icons/youTubeIcon";
import { CrossIcon } from "../icons/crossIcon";
import { SidebarItems } from "./SidebarItem";

export type FilterType = "twitter" | "youtube" | "link" | "note" | null;

interface SideBarProps {
  onSelect: (type: FilterType) => void;
  selectedType?: FilterType;
  isOpen?: boolean;
  onClose?: () => void;
}

export function SideBar(props: SideBarProps){
    const handleCategoryClick = (type: "twitter" | "youtube" | "link" | "note") => {
        if (props.selectedType === type) {
            props.onSelect(null);
        } else {
            props.onSelect(type);
        }
        props.onClose?.();
    };

    const handleBrandClick = () => {
        props.onSelect(null);
        props.onClose?.();
    };

    return(
        <>
            {/* Mobile / Tablet Backdrop Overlay */}
            {props.isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
                    onClick={props.onClose}
                />
            )}

            {/* Sidebar Drawer */}
            <aside 
                className={`h-screen bg-white border-r-2 border-gray-200 w-72 fixed left-0 top-0 pl-6 pr-4 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                    props.isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:shadow-none"
                }`}
            >
                <div className="flex text-2xl sm:text-3xl pt-6 items-center justify-between">
                    <Link 
                        to="/dashboard" 
                        onClick={handleBrandClick} 
                        className="flex items-center gap-3 hover:cursor-pointer select-none"
                    >
                        <div className="text-purple-600">
                            <BrainIcon />
                        </div>
                        <div className="font-semibold text-gray-900">
                            Second Brain
                        </div>
                    </Link>

                    {/* Close button on mobile/tablet */}
                    <button
                        onClick={props.onClose}
                        className="p-2 text-gray-500 hover:text-gray-900 lg:hidden cursor-pointer"
                        aria-label="Close sidebar"
                    >
                        <CrossIcon size="md" />
                    </button>
                </div>

                <div className="pt-8 flex flex-col gap-1.5">
                    <SidebarItems 
                        onclick={() => handleCategoryClick("twitter")} 
                        text="Twitter" 
                        icon={<TwitterIcon />} 
                        active={props.selectedType === "twitter"}
                    />

                    <SidebarItems 
                        onclick={() => handleCategoryClick("youtube")} 
                        text="Youtube" 
                        icon={<YoutubeIcon />} 
                        active={props.selectedType === "youtube"}
                    />

                    <SidebarItems 
                        onclick={() => handleCategoryClick("link")} 
                        text="Link" 
                        icon={<LinkIcon />} 
                        active={props.selectedType === "link"}
                    />

                    <SidebarItems 
                        onclick={() => handleCategoryClick("note")} 
                        text="Notes" 
                        icon={<NoteIcon />} 
                        active={props.selectedType === "note"}
                    />
                </div>
            </aside>
        </>
    )
}