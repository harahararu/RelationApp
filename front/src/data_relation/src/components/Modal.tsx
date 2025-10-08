import React, { FC, useEffect, useRef } from "react";
import { X } from "lucide-react";

export type ModalProps = {
    isOpen: boolean;
    close: () => void;
    children: React.ReactNode;
    title?: string;
    size?: "sm" | "md" | "lg";
    className?: string;
    disableOverlayClick?: boolean;
    ariaLabelledBy?: string;
};

const Modal: FC<ModalProps> = ({
    isOpen,
    close,
    children,
    title,
    size = "md",
    className = "",
    disableOverlayClick = false,
    ariaLabelledBy = "modal-title",
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    // フォーカストラップ
    useEffect(() => {
        if (isOpen && modalRef.current) {
            modalRef.current.focus();
            const focusableElements = modalRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const first = focusableElements[0] as HTMLElement;
            const last = focusableElements[focusableElements.length - 1] as HTMLElement;

            const trapFocus = (e: KeyboardEvent) => {
                if (e.key === "Tab") {
                    if (e.shiftKey && document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    } else if (!e.shiftKey && document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            };

            document.addEventListener("keydown", trapFocus);
            return () => document.removeEventListener("keydown", trapFocus);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses =
        size === "sm"
            ? "w-full max-w-sm"
            : size === "lg"
                ? "w-full max-w-lg"
                : "w-full max-w-md";

    return (
        <div
            className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300"
            onClick={() => !disableOverlayClick && close()}
        >
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={ariaLabelledBy}
                className={`relative bg-white rounded-lg shadow-lg p-6 animate-fade-in ${sizeClasses} ${className}`}
                onClick={(e) => e.stopPropagation()}
                tabIndex={-1}
            >
                {(title || isOpen) && (
                    <div className="flex justify-between items-center mb-4">
                        {title && (
                            <h2 id={ariaLabelledBy} className="text-lg font-semibold">
                                {title}
                            </h2>
                        )}
                        <button
                            onClick={close}
                            className="text-gray-500 hover:text-gray-700 rounded-full h-10 w-10 flex items-center justify-center"
                            aria-label="モーダルを閉じる"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}
                <div>{children}</div>
            </div>
        </div>
    );
};

export default Modal;