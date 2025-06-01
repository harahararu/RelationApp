'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { updateTable } from '../../actions';

interface Database {
  id: number;
  name: string;
}

interface Column {
  id?: number;
  name: string;
  type: string;
  constraints: string[];
  comment?: string;
}

interface EditTableFormProps {
  tableId: number;
  initialName: string;
  initialDatabaseId: number | null;
  initialColumns: Column[];
  databases: Database[];
}

export default function EditTableForm({
  tableId,
  initialName,
  initialDatabaseId,
  initialColumns,
  databases,
}: EditTableFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(updateTable, {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [columns, setColumns] = useState<Column[]>(initialColumns);

  useEffect(() => {
    if (state.success) {
      router.push('/tables');
    }
  }, [state.success, router]);

  const addColumn = () => {
    setColumns([...columns, { name: '', type: '', constraints: [] }]);
  };

  const updateColumn = (index: number, field: keyof Column, value: string | string[]) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    setColumns(newColumns);
  };

  const removeColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    formData.delete('columns');
    columns.forEach((col) => formData.append('columns', JSON.stringify(col)));
    try {
      await formAction(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">テーブル編集</h1>
      <form action={handleSubmit} className="space-y-6">
        <input type="hidden" name="id" value={tableId} />
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            テーブル名
          </label>
          <input
            type="text"
            name="name"
            id="name"
            defaultValue={initialName}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={isSubmitting}
          />
          {state.errors?.name && (
            <p className="mt-1 text-sm text-red-600">{state.errors.name[0]}</p>
          )}
        </div>
        <div>
          <label htmlFor="databaseId" className="block text-sm font-medium text-gray-700">
            データベース（任意）
          </label>
          <select
            name="databaseId"
            id="databaseId"
            defaultValue={initialDatabaseId?.toString() ?? ''}
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
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">カラム</h2>
          {columns.map((column, index) => (
            <div key={index} className="flex space-x-4 mb-4 items-start">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">名前</label>
                <input
                  type="text"
                  value={column.name}
                  onChange={(e) => updateColumn(index, 'name', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">型</label>
                <input
                  type="text"
                  value={column.type}
                  onChange={(e) => updateColumn(index, 'type', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">制約（カンマ区切り）</label>
                <input
                  type="text"
                  value={column.constraints.join(',')}
                  onChange={(e) => updateColumn(index, 'constraints', e.target.value.split(',').map(s => s.trim()))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">コメント</label>
                <input
                  type="text"
                  value={column.comment || ''}
                  onChange={(e) => updateColumn(index, 'comment', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  disabled={isSubmitting}
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => removeColumn(index)}
                className="mt-6 text-red-600 bg-transparent hover:bg-red-100"
                disabled={isSubmitting}
              >
                削除
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="primary"
            onClick={addColumn}
            className="mt-2"
            disabled={isSubmitting}
          >
            カラムを追加
          </Button>
        </div>
        {state.errors?._form && (
          <p className="text-sm text-red-600">{state.errors._form[0]}</p>
        )}
        <div className="flex space-x-4">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
          >
            更新
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/tables')}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
        </div>
      </form>
    </div>
  );
}