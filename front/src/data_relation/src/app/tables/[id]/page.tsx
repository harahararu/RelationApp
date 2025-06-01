
import prisma from '@/lib/prisma';
import { Suspense } from 'react';
import Link from 'next/link';
import Button from '@/components/Button';

export default async function TableDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tableId = parseInt(id);

  if (isNaN(tableId)) {
    return <div>無効なテーブルIDです</div>;
  }

  const table = await prisma.table.findUnique({
    where: { id: tableId },
    include: {
      columns: { select: { id: true, name: true, type: true, constraints: true, comment: true } },
      database: { select: { id: true, name: true } },
      projects: { select: { project: { select: { id: true, name: true } } } },
    },
  });

  if (!table) {
    return <div>テーブルが見つかりませんでした</div>;
  }

  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{table.name} の詳細</h1>
          <div className="space-x-4">
            <Link href={`/tables/edit/${table.id}`}>
              <Button variant="primary">テーブルを編集</Button>
            </Link>
            <Link href="/tables">
              <Button variant="secondary">一覧に戻る</Button>
            </Link>
          </div>
        </div>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700">テーブル情報</h2>
          <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">名前</dt>
              <dd className="mt-1 text-sm text-gray-900">{table.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">データベース</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {table.database ? (
                  <div>
                    {table.database.name}
                  </div>
                ) : (
                  '未登録'
                )}
              </dd>
            </div>
          </dl>
        </div>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">カラム</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-md">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-700">名前</th>
                  <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-700">型</th>
                  <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-700">制約</th>
                  <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-700">コメント</th>
                </tr>
              </thead>
              <tbody>
                {table.columns.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-600">
                      カラムがありません
                    </td>
                  </tr>
                ) : (
                  table.columns.map((col) => (
                    <tr key={col.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{col.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{col.type}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{col.constraints}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{col.comment}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Suspense>
  );
}

