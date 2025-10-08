'use client';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateDatabase } from '../../actions';
import { useTestConnection } from '../../hooks/useTestConnection';
import { Database } from '@/types/types';

export default function EditDatabaseForm({
    databaseId,
    initialData,
}: {
    databaseId: number;
    initialData: Database;
}) {
    const router = useRouter();
    const [state, formAction, updatePending] = useActionState(updateDatabase, {
        errors: {
            _form: [],
            validate: undefined
        }
    });
    const [testState, setFormData, testConnection, testPending] = useTestConnection(initialData);

    // 入力値の変更ハンドラー
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'port' ? (value ? Number(value) : null) : value,
        }));
    };

    useEffect(() => {
        if (state.success) {
            router.push('/databases');
        }
    }, [state.success, router]);

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">データベース編集</h1>
            <form action={formAction} className="space-y-4">
                <input type="hidden" name="id" value={databaseId} />
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        データベース名
                    </label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        defaultValue={initialData.name}
                        onChange={handleChange}
                        placeholder="データベース名を入力"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={updatePending || testPending}
                    />
                    {state.errors?.validate?.name && (
                        <p className="mt-1 text-sm text-red-600">{state.errors.validate.name[0]}</p>
                    )}
                </div>
                <div>
                    <label htmlFor="dbms" className="block text-sm font-medium text-gray-700">
                        DBMS
                    </label>
                    <select
                        name="dbms"
                        id="dbms"
                        defaultValue={initialData.dbms}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={updatePending || testPending}
                    >
                        <option value="PostgreSQL">PostgreSQL</option>
                        <option value="MySQL">MySQL</option>
                        <option value="SQLite">SQLite</option>
                        <option value="Oracle">Oracle</option>
                    </select>
                    {state.errors?.validate?.dbms && (
                        <p className="mt-1 text-sm text-red-600">{state.errors.validate.dbms[0]}</p>
                    )}
                </div>
                <div>
                    <label htmlFor="host" className="block text-sm font-medium text-gray-700">
                        ホスト
                    </label>
                    <input
                        type="text"
                        name="host"
                        id="host"
                        defaultValue={initialData.host}
                        onChange={handleChange}
                        placeholder="ホストを入力（例: localhost）"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={updatePending || testPending}
                    />
                    {state.errors?.validate?.host && (
                        <p className="mt-1 text-sm text-red-600">{state.errors.validate.host[0]}</p>
                    )}
                </div>
                <div>
                    <label htmlFor="port" className="block text-sm font-medium text-gray-700">
                        ポート（任意）
                    </label>
                    <input
                        type="number"
                        name="port"
                        id="port"
                        defaultValue={initialData.port ?? undefined}
                        onChange={handleChange}
                        placeholder="ポートを入力（例: 5432）"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={updatePending || testPending}
                    />
                    {state.errors?.validate?.port && (
                        <p className="mt-1 text-sm text-red-600">{state.errors.validate.port[0]}</p>
                    )}
                </div>
                <div>
                    <label htmlFor="databaseName" className="block text-sm font-medium text-gray-700">
                        データベース名（物理名）
                    </label>
                    <input
                        type="text"
                        name="databaseName"
                        id="databaseName"
                        defaultValue={initialData.databaseName}
                        onChange={handleChange}
                        placeholder="データベース名を入力"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={updatePending || testPending}
                    />
                    {state.errors?.validate?.databaseName && (
                        <p className="mt-1 text-sm text-red-600">{state.errors.validate.databaseName[0]}</p>
                    )}
                </div>
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        ユーザー名
                    </label>
                    <input
                        type="text"
                        name="username"
                        id="username"
                        defaultValue={initialData.username}
                        onChange={handleChange}
                        placeholder="ユーザー名を入力"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={updatePending || testPending}
                    />
                    {state.errors?.validate?.username && (
                        <p className="mt-1 text-sm text-red-600">{state.errors.validate.username[0]}</p>
                    )}
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        パスワード
                    </label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        defaultValue={initialData.password}
                        onChange={handleChange}
                        placeholder="パスワードを入力"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={updatePending || testPending}
                    />
                    {state.errors?.validate?.password && (
                        <p className="mt-1 text-sm text-red-600">{state.errors.validate.password[0]}</p>
                    )}
                </div>
                {state.errors?._form && (
                    <p className="text-sm text-red-600">{state.errors._form[0]}</p>
                )}
                {testState.message && (
                    <p className={`mt-2 text-sm ${testState.success ? 'text-green-600' : 'text-red-600'}`}>
                        {testState.message}
                    </p>
                )}
                <div className="flex space-x-4">
                    <button
                        type="submit"
                        disabled={updatePending || testPending}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                    >
                        {updatePending ? '更新中...' : '更新'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/databases')}
                        className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={testConnection}
                        disabled={updatePending || testPending}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                    >
                        {testPending ? 'テスト中...' : '接続テスト'}
                    </button>
                </div>
            </form>
        </div>
    );
}