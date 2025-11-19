import prisma from '@/lib/prisma';
import { Suspense } from 'react';
import ERDEditor from '../components/ERDEditor';

export default async function ERDPage({ params }: { params: Promise<{ projectId: string }> }) {
	const { projectId } = await params;
	const id = parseInt(projectId);

	if (isNaN(id)) {
		return <div>無効なプロジェクトIDです</div>;
	}

	const [project, availableTables, relationships] = await Promise.all([
		prisma.project.findUnique({
			where: { id },
			include: {
				tables: {
					include: {
						table: {
							include: {
								columns: {
									select: { id: true, name: true, type: true, constraints: true, comment: true },
								},
							},
						},
					},
				},
			},
		}),
		prisma.table.findMany({
			select: {
				id: true,
				name: true,
				columns: {
					select: { id: true, name: true, type: true, constraints: true, comment: true },
				},
			},
		}),
		prisma.relation.findMany({
			where: { projectId: id },
			select: { id: true, sourceTable: true, targetTable: true, sourceColumn: true, targetColumn: true, type: true },
		}),
	]);


	if (!project) {
		return <div>プロジェクトが見つかりませんでした</div>;
	}

	const initialNodes = project.tables.map((pt, index) => ({
		id: pt.table.id.toString(),
		type: 'table' as const,
		position: { 
			x: pt.positionX ?? 100 + index * 300,
			y: pt.positionY ?? 100
		},
		data: { name: pt.table.name, columns: pt.table.columns },
	}));

	const initialEdges = relationships.map((rel) => ({
		id: rel.id.toString(),
		source: rel.sourceTable.id.toString(),
		target: rel.targetTable.id.toString(),
		sourceHandle: `${rel.sourceTable.name}.${rel.sourceColumn.name}`,
		targetHandle: `${rel.targetTable.name}.${rel.targetColumn.name}`,
		type: 'relationship' as const,
		data: { cardinality: rel.type },
	}));

	return (
		<Suspense fallback={<div>読み込み中...</div>}>
			<ERDEditor
				initialNodes={initialNodes}
				initialEdges={initialEdges}
				projectId={id}
				availableTables={availableTables}
			/>
		</Suspense>
	);
}