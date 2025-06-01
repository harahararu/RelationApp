'use client';

import { useState, useCallback } from 'react';

interface ModalState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export function useModal(): ModalState {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return { isOpen, openModal, closeModal };
}