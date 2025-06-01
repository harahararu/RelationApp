import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Suspense } from 'react';
import DeleteButton from '@/components/DeleteButton';
import { deleteDatabase } from './actions';

export default async function DatabasesPage() {
  const databases = await prisma.database.findMany({
    select: { id: true, name: true, dbms: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <div className="max-w-4xl mx-auto mt-10 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">データベース一覧</h1>
          <Link
            href="/databases/new"
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            新規登録
          </Link>
        </div>
        {databases.length === 0 ? (
          <p className="text-gray-600">
            データベースがありません。新規登録してください。
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-md">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-700">
                    データベース名
                  </th>
                  <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-700">
                    DBMS
                  </th>
                  <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-700">
                    作成日
                  </th>
                  <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-700">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody>
                {databases.map((db) => (
                  <tr key={db.id}>
                    <td className="px-6 py-4 border-b text-sm text-gray-900">
                      <Link href={`/databases/${db.id}`}>
                        {db.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 border-b text-sm text-gray-900">
                      {db.dbms}
                    </td>
                    <td className="px-6 py-4 border-b text-sm text-gray-900">
                      {new Date(db.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 border-b text-sm space-x-2">
                      <Link
                        href={`/databases/edit/${db.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        編集
                      </Link>
                      <DeleteButton
                        action={deleteDatabase}
                        itemName="データベース"
                        id={db.id.toString()}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Suspense>
  );
}