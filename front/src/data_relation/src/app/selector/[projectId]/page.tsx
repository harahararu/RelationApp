import prisma from '@/lib/prisma';
import { Suspense } from 'react';
import SelectorPageClient from '../components/SelectorClient';

export default async function Home({ params }: { params: Promise<{ projectId: string }> }) {
	const { projectId } = await params;
	const id = parseInt(projectId);

	if (isNaN(id)) {
		return <div>無効なプロジェクトIDです</div>;
	}

	const [projectTables, relations] = await Promise.all([
		prisma.project.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				tables: {
					select: {
						table: {
							select: {
								id: true,
								name: true,
								databaseId: true,
								columns: {
									select: { id: true, name: true, type: true, constraints: true, comment: true },
								},
							}
						}
					}
				}
			}
		}),
		prisma.relation.findMany({
			where: { projectId: id },
			select: {
				id: true,
				sourceTable: { select: { id: true, name: true } },
				targetTable: { select: { id: true, name: true } },
				sourceColumn: { select: { id: true, name: true } },
				targetColumn: { select: { id: true, name: true } },
				type: true,
			},
		}),
	]);

	if (!projectTables) {
		return <div>プロジェクトが見つかりませんでした</div>;
	}

	const tables = projectTables.tables.map((pt) => pt.table);

	return (
		<Suspense fallback={<div>読み込み中...</div>}>
			<div className="container mx-auto p-4">
				<h1 className="text-2xl font-bold mb-4">Data Explorer for Project: {projectTables.name}</h1>
				{/* 検索フォーム */}
				<SelectorPageClient
					initialData={tables}
					relations={relations}
				/>
			</div>
		</Suspense>
	);
}