import { useState } from "react";

export const useSidebar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    return {
        isSidebarOpen,
        toggleSidebar,
    };
};