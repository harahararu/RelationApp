import { Suspense } from 'react';
import prisma from '@/lib/prisma';
import EditProjectForm from './EditProjectForm';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // params を await
  const projectId = parseInt(id);

  if (isNaN(projectId)) {
    return <div>無効なプロジェクトIDです</div>;
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { name: true },
  });

  if (!project) {
    return <div>プロジェクトが見つかりません</div>;
  }

  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <EditProjectForm projectId={projectId} initialName={project.name} />
    </Suspense>
  );
}