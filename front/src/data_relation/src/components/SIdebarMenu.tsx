import React, { FC } from "react";
import { Transition } from "@headlessui/react";
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
      className="bg-gray-100 shadow-md flex flex-col h-full transition-all duration-300 ease-in-out"
      style={{ width: isSidebarOpen ? "16rem" : "3rem" }}
      aria-label={ariaLabel}
      aria-expanded={isSidebarOpen}
    >
      <div className="p-4 flex items-center justify-between min-w-[3rem]">
        <Transition
          show={isSidebarOpen}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {header}
        </Transition>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
          aria-label={isSidebarOpen ? "サイドバーを閉じる" : "サイドバーを開く"}
        >
          {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
      <Transition
        show={isSidebarOpen}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="flex-1 p-4 overflow-y-auto">{children}</div>
      </Transition>
    </nav>
  );
};

export default SidebarMenu;