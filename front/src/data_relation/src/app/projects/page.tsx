import prisma from '@/lib/prisma';
import { Suspense } from 'react';
import Link from 'next/link';
import Button from '@/components/Button';
import DeleteButton from '@/components/DeleteButton';
import { deleteProject } from './actions';

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    select: { id: true, name: true },
    orderBy: { id: 'asc' },
  });

  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">プロジェクト一覧</h1>
          <Link href="/projects/new">
            <Button variant="primary">新規登録</Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-700">プロジェクト名</th>
                <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-700">アクション</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-600">
                    データがありません
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 text-sm text-gray-900">
                        {project.name}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <Link href={`/projects/edit/${project.id}`} className="text-blue-600 hover:underline">
                        編集
                      </Link>
                      <Link href={`/erd/${project.id}`} className="text-blue-600 hover:underline">
                        ER図
                      </Link>
                      <DeleteButton action={deleteProject} itemName="プロジェクト" id={project.id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Suspense>
  );
}