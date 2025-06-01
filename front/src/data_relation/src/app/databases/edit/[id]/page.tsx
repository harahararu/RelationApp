import { Suspense } from 'react';
import prisma from '@/lib/prisma';
import EditDatabaseForm from './EditDatabaseForm';

export default async function EditDatabasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const databaseId = parseInt(id);

  if (isNaN(databaseId)) {
    return <div>無効なデータベースIDです</div>;
  }

  const database = await prisma.database.findUnique({
    where: { id: databaseId },
    select: { name: true, dbms: true, host: true, port: true, databaseName: true, username: true, password: true },
  });

  if (!database) {
    return <div>データベースが見つかりませんでした</div>;
  }

  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <EditDatabaseForm
        databaseId={databaseId}
        initialData={database}
      />
  </Suspense>
  );
}