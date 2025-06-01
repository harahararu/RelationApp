'use client';
import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTable } from '../actions';

interface Database {
  id: number;
  name: string;
}

interface NewTableFormProps {
  databases: Database[];
}

export default function NewTableForm({ databases }: NewTableFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(createTable, {});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (state.success) {
      router.push('/tables');
    }
  }, [state.success, router]);

  const handleSubmit = async (formData: FormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await formAction(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">新規テーブル登録</h1>
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            テーブル名
          </label>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="テーブル名を入力"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={isSubmitting}
          />
          {state.errors?.name && (
            <p className="mt-1 text-sm text-red-600">{state.errors.name[0]}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="databaseId"
            className="block text-sm font-medium text-gray-700"
          >
            データベース（任意）
          </label>
          <select
            name="databaseId"
            id="databaseId"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={isSubmitting}
          >
            <option value="">選択なし</option>
            {databases.map((db) => (
              <option key={db.id} value={db.id}>
                {db.name}
              </option>
            ))}
          </select>
          {state.errors?.databaseId && (
            <p className="mt-1 text-sm text-red-600">{state.errors.databaseId[0]}</p>
          )}
        </div>
        {state.errors?._form && (
          <p className="text-sm text-red-600">{state.errors._form[0]}</p>
        )}
        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition disabled:bg-blue-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? '登録中...' : '登録'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/tables')}
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
            disabled={isSubmitting}
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}