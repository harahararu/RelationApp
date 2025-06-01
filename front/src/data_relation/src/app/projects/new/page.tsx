'use client';
import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createProject } from '../actions';

export default function NewProjectPage() {
  const router = useRouter();
  const [state, formAction] = useActionState(createProject, {});

  // 成功時にER図編集画面に遷移
  useEffect(() => {
    if (state.success && state.projectId) {
      router.push(`/erd/${state.projectId}`);
    }
  }, [state.success, state.projectId, router]);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        新規プロジェクト登録
      </h1>
      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            プロジェクト名
          </label>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="プロジェクト名を入力"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state.errors?.name && (
            <p className="mt-1 text-sm text-red-600">{state.errors.name[0]}</p>
          )}
        </div>
        {state.errors?._form && (
          <p className="text-sm text-red-600">{state.errors._form[0]}</p>
        )}
        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 bg-primary text-white px-4 py Rank 2 rounded-md hover:bg-blue-700 transition"
          >
            登録
          </button>
          <button
            type="button"
            onClick={() => router.push('/projects')}
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}