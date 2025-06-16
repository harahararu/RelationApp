import React, { FC } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSidebar } from "@/hooks/useSidebar";

type SidebarMenuProps = {
  header?: React.ReactNode;
  children?: React.ReactNode;
  ariaLabel?: string;
};

const SidebarMenu: FC<SidebarMenuProps> = ({
  header,
  children,
  ariaLabel = "サイドバー",
}) => {
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  return (
    <nav
      className={`bg-gray-100 shadow-md transition-all ease-in-out ${
        isSidebarOpen ? "w-64" : "w-12"
      } flex flex-col h-full`}
      aria-label={ariaLabel}
    >
      <div className="p-4 flex items-center justify-between min-w-[64px]">
        {isSidebarOpen && header}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
          aria-label={isSidebarOpen ? "サイドバーを閉じる" : "サイドバーを開く"}
        >
          {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
      {isSidebarOpen && (
        <div className="flex-1 p-4 overflow-y-auto">{children}</div>
      )}
    </nav>
  );
};

export default SidebarMenu;