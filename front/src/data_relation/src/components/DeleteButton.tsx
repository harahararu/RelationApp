'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from './Button';

interface DeleteButtonProps {
  action: (formData: FormData) => Promise<any>;
  itemName: string;
  id: string;
}

export default function DeleteButton({ action, itemName, id }: DeleteButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleDelete = async (formData: FormData) => {
    if (!confirm(`${itemName}を削除しますか？`)) {
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await action(formData);
      if (result.success) {
        router.refresh(); // サーバーコンポーネントを再レンダリング
      } else {
        alert(result.errors?._form?.[0] || '削除に失敗しました');
      }
    } catch (error) {
      alert('削除に失敗しました');
    } finally {
      setIsSubmitting(true);
    }
  };

  return (
    <form action={handleDelete}>
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        variant="secondary"
        isLoading={isSubmitting}
        className="text-red-600 bg-red-500 hover:bg-red-100"
      >
        削除
      </Button>
    </form>
  );
}