'use client';
import { useCallback, useState } from "react";
import Modal, { ModalProps } from "@/components/Modal"

type ModalWrapperProps = Omit<ModalProps, "isOpen" | "close">;

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
        ({ children, title, size, className, disableOverlayClick }: ModalWrapperProps) => (
            <Modal
                isOpen= { isOpen }
                close = { close }
                title = { title }
                size = { size }
                className = { className }
                disableOverlayClick = { disableOverlayClick }
            >
                { children }
            </Modal>
    ),
        [isOpen, close]
  );

return [ModalWrapper, open, close];
};