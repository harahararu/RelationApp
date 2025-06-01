import { Suspense } from 'react';
import prisma from '@/lib/prisma';
import EditTableForm from './EditTableForm';

export default async function EditTablePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tableId = parseInt(id);

  if (isNaN(tableId)) {
    return <div>無効なテーブルIDです</div>;
  }

  const [table, databases] = await Promise.all([
    prisma.table.findUnique({
      where: { id: tableId },
      include: {
        columns: {
          select: { id: true, name: true, type: true, constraints: true, comment: true },
        },
      },
    }),
    prisma.database.findMany({
      select: { id: true, name: true },
    }),
  ]);

  if (!table) {
    return <div>テーブルが見つかりません</div>;
  }

  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <EditTableForm
        tableId={tableId}
        initialName={table.name}
        initialDatabaseId={table.databaseId}
        initialColumns={table.columns}
        databases={databases}
      />
    </Suspense>
  );
}