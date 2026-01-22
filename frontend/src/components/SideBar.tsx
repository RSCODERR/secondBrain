import { Link } from "react-router-dom";
import { BrainIcon } from "../icons/brainIcon";
import { LinkIcon } from "../icons/linkIcon";
import { NoteIcon } from "../icons/noteIcon";
import { TwitterIcon } from "../icons/twitterIcon";
import { YoutubeIcon } from "../icons/youTubeIcon";
import { SidebarItems } from "./SidebarItem";

interface SideBarProps {
  onSelect: (type: "twitter" | "youtube" | "link" | "note") => void
}

export function SideBar(props: SideBarProps){
    return(
        <div className="h-screen bg-white border-r-2 border-gray-200 w-72 fixed left-0 top-0 pl-6">
            <div className="flex text-3xl pt-6 items-center gap-4">
                <div className="text-purple-600">
                    <BrainIcon />
                </div>
                <div className="font-semibold">
                    <Link to="/dashboard" className="hover:cursor-pointer">Second Brain</Link> 
                </div>
            </div>
            <div className="pt-8 pl-4">
                <SidebarItems onclick={() => props.onSelect("twitter")} text="Twitter" icon={<TwitterIcon />} />

                <SidebarItems onclick={() => props.onSelect("youtube")} text="Youtube" icon={<YoutubeIcon />} />

                <SidebarItems onclick={() => props.onSelect("link")} text = "Link" icon={<LinkIcon />} />

                <SidebarItems onclick={() => props.onSelect("note")} text = "Notes" icon = {<NoteIcon />} />
            </div>
        </div>
    )
}