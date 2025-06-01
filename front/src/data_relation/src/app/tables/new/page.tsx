import prisma from '@/lib/prisma';
import { Suspense } from 'react';
import NewTableForm from './NewTableForm';

export default async function NewTablePage() {
  const databases = await prisma.database.findMany({
    select: { id: true, name: true },
  });

  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <NewTableForm databases={databases} />
    </Suspense>
  );
}