import { useCallback, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

type ModalWrapperProps = {
    children: React.ReactNode;
    title?: string;
    size?: "sm" | "md" | "lg";
    className?: string;
    disableOverlayClick?: boolean;
};

type UseModalReturn = [
    ModalWrapper: React.FC<ModalWrapperProps>,
    open: () => void,
    close: () => void,
];

export const useModal = (): UseModalReturn => {
    const [isOpen, setIsOpen] = useState(false);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);

    const ModalWrapper = useCallback(
        ({ children, title, size = "md", className = "", disableOverlayClick = false }: ModalWrapperProps) => {
            const sizeClasses =
                size === "sm"
                    ? "w-full max-w-sm"
                    : size === "lg"
                        ? "w-full max-w-3xl"
                        : "w-full max-w-md";

            return (
                <Dialog
                    open={isOpen}
                    onClose={disableOverlayClick ? () => { } : close}
                    className="relative z-50"
                >
                    <div
                        className="fixed inset-0 bg-black/30 transition-opacity duration-300"
                        aria-hidden="true"
                    />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <DialogPanel
                            className={`bg-white rounded-lg shadow-xl p-6 transform transition-all duration-300 ${sizeClasses} ${className}`}
                        >
                            {title && (
                                <div className="flex justify-between items-center mb-4">
                                    <DialogTitle className="text-lg font-semibold text-gray-800">
                                        {title}
                                    </DialogTitle>
                                    <button
                                        onClick={close}
                                        className="text-gray-500 hover:text-gray-700 rounded-full h-10 w-10 flex items-center justify-center"
                                        aria-label="モーダルを閉じる"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            )}
                            {children}
                        </DialogPanel>
                    </div>
                </Dialog>
            );
        },
        [isOpen, close]
    );

    return [ModalWrapper, open, close];
};