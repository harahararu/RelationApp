import prisma from '@/lib/prisma';
import { Suspense } from 'react';
import Link from 'next/link';
import Button from '@/components/Button';
import DeleteButton from '@/components/DeleteButton';
import { deleteTable } from '../../tables/actions';

export default async function DatabaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const databaseId = parseInt(id);

  if (isNaN(databaseId)) {
    return <div>無効なデータベースIDです</div>;
  }

  const database = await prisma.database.findUnique({
    where: { id: databaseId },
    include: {
      tables: {
        select: { id: true, name: true },
      },
    },
  });

  if (!database) {
    return <div>データベースが見つかりませんでした</div>;
  }

  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{database.name} の詳細</h1>
          <div className="space-x-4">
            <Link href={`/databases/edit/${database.id}`}>
              <Button variant="primary">
                データベースを編集
              </Button>
            </Link>
            <Link href={`/databases`}>
              <Button variant="secondary">
                一覧に戻る
              </Button>
            </Link>
          </div>
        </div>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700">データベース情報</h2>
          <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">名前</dt>
              <dd className="mt-1 text-sm text-gray-900">{database.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">DBMS</dt>
              <dd className="mt-1 text-sm text-gray-900">{database.dbms}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">ホスト</dt>
              <dd className="mt-1 text-sm text-gray-900">{database.host}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">ポート</dt>
              <dd className="mt-1 text-sm text-gray-900">{database.port ?? '未設定'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">データベース名（物理名）</dt>
              <dd className="mt-1 text-sm text-gray-900">{database.databaseName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">ユーザー名</dt>
              <dd className="mt-1 text-sm text-gray-900">{database.username}</dd>
            </div>
          </dl>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">関連テーブル</h2>
          {database.tables.length === 0 ? (
            <p className="text-gray-600">このデータベースに紐づくテーブルはありません。</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow-md">
                <thead>
                  <tr>
                    <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-700">テーブル名</th>
                    <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-700">アクション</th>
                  </tr>
                </thead>
                <tbody>
                  {database.tables.map((table) => (
                    <tr key={table.id} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <Link href={`/tables/${table.id}`} className="text-blue-600 hover:underline">
                          {table.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <Link href={`/tables/edit/${table.id}`} className="text-blue-600 hover:underline">
                          編集
                        </Link>
                        <DeleteButton action={deleteTable} itemName="テーブル" id={table.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Suspense>
  );
}