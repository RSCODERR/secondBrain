import { Link, useNavigate } from "react-router-dom";
import { BrainIcon } from "../icons/brainIcon";
import { LinkIcon } from "../icons/linkIcon";
import { NoteIcon } from "../icons/noteIcon";
import { TwitterIcon } from "../icons/twitterIcon";
import { YoutubeIcon } from "../icons/youTubeIcon";
import { CrossIcon } from "../icons/crossIcon";
import { LogoutIcon } from "../icons/logoutIcon";
import { SettingsIcon } from "../icons/settingsIcon";
import { SidebarItems } from "./SidebarItem";
import { useAuth } from "../context/AuthContext";

export type FilterType = "twitter" | "youtube" | "link" | "note" | null;

interface SideBarProps {
  onSelect: (type: FilterType) => void;
  selectedType?: FilterType;
  isOpen?: boolean;
  onClose?: () => void;
}

export function SideBar(props: SideBarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  return (
    <>
      {/* Mobile / Tablet Backdrop Overlay */}
      {props.isOpen && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={props.onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`h-screen bg-white dark:bg-[#0c120e] border-r border-stone-200 dark:border-emerald-950/70 w-72 fixed left-0 top-0 px-5 py-6 z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          props.isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:shadow-none"
        }`}
      >
        <div>
          <div className="flex text-2xl sm:text-3xl items-center justify-between">
            <Link
              to="/dashboard"
              onClick={handleBrandClick}
              className="flex items-center gap-3 hover:cursor-pointer select-none"
            >
              <div className="text-[#2d4a31] dark:text-emerald-400">
                <BrainIcon />
              </div>
              <div className="font-semibold text-stone-900 dark:text-stone-100">
                Second Brain
              </div>
            </Link>

            {/* Close button on mobile/tablet */}
            <button
              onClick={props.onClose}
              className="p-2 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white lg:hidden cursor-pointer rounded-lg hover:bg-stone-100 dark:hover:bg-[#142017] transition-colors"
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
        </div>

        {/* Bottom User Profile & Logout */}
        <div className="border-t border-stone-200 dark:border-emerald-950/70 pt-4 flex flex-col gap-2.5">

          {user && (
            <div className="px-3 py-0.5 text-xs text-stone-500 dark:text-stone-400 truncate">
              Signed in as <span className="font-semibold text-stone-800 dark:text-emerald-300">@{user.username}</span>
            </div>
          )}

          {/* Contact Us link */}
          <button
            onClick={() => {
              navigate("/contact");
              props.onClose?.();
            }}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#142017] hover:text-stone-900 dark:hover:text-emerald-200 transition-colors font-medium cursor-pointer border border-transparent hover:border-stone-200 dark:hover:border-emerald-900/50 group text-sm"
          >
            <svg className="w-5 h-5 text-stone-500 group-hover:text-stone-900 dark:text-stone-400 dark:group-hover:text-emerald-300 transition-colors shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
            <span className="font-semibold">Contact Us</span>
          </button>

          {/* Settings link */}
          <button
            onClick={() => {
              navigate("/settings");
              props.onClose?.();
            }}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#142017] hover:text-stone-900 dark:hover:text-emerald-200 transition-colors font-medium cursor-pointer border border-transparent hover:border-stone-200 dark:hover:border-emerald-900/50 group text-sm"
          >
            <SettingsIcon size="md" />
            <span className="font-semibold">Account Settings</span>
          </button>

          <button
            onClick={() => {
              logout();
              props.onClose?.();
            }}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300 transition-colors font-medium cursor-pointer border border-transparent hover:border-red-200 dark:hover:border-red-900/40 group text-sm"
          >
            <LogoutIcon size="md" />
            <span className="font-semibold">Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}