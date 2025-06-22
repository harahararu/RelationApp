'use client';

import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { NodeProps, Handle, Position, Node, Edge } from '@xyflow/react';
import { updateTable, createColumn, updateColumn, deleteColumn, } from './actions';
import { CustomNode } from '@/types/reactFlow';
import { Column } from '@/types/types';

type NodeData = {
	setNodes: Dispatch<SetStateAction<Node<CustomNode>[]>>;
	setEdges: Dispatch<SetStateAction<Edge[]>>;
	nodes: Node<CustomNode>[];
	projectId: number;
	name: string;
    columns: Column[];
}

type CustomNodeProps = NodeProps<Node<NodeData>>;

const CustomTableNode: React.FC<CustomNodeProps> = ({ id, data }) => {
	const [isEditingTable, setIsEditingTable] = useState(false);
	const [tableName, setTableName] = useState(data.name);
	const [isAddingColumn, setIsAddingColumn] = useState(false);
	const [newColumn, setNewColumn] = useState<Column>({ name: '', type: 'string', constraints: [], id: '' });
	const [editingColumnIndex, setEditingColumnIndex] = useState<number | null>(null);
	const [editingColumn, setEditingColumn] = useState<Column | null>(null);
	const [error, setError] = useState<string | null>(null);

	const { setNodes, setEdges, columns, nodes, projectId } = data;

	const handleSaveTable = async () => {
		if (!setNodes || !setEdges) {
			console.error('setNodesまたはsetEdgesが定義されていません');
			setError('内部エラーが発生しました。');
			return;
		}
		const oldTableName = data.name;
		const newTableName = tableName;

		try {
			await updateTable(id, { name: newTableName });

			setNodes((nds: Node<CustomNode>[]) =>
				nds.map((node) =>
					node.id === id ? { ...node, data: { ...node.data, name: newTableName } } : node
				)
			);

			setEdges((eds: Edge[]) =>
				eds.map((edge) => {
					let newSourceHandle = edge.sourceHandle;
					let newTargetHandle = edge.targetHandle;

					if (edge.sourceHandle?.startsWith(`${oldTableName}.`)) {
						newSourceHandle = edge.sourceHandle.replace(`${oldTableName}.`, `${newTableName}.`);
					}
					if (edge.targetHandle?.startsWith(`${oldTableName}.`)) {
						newTargetHandle = edge.targetHandle.replace(`${oldTableName}.`, `${newTableName}.`);
					}

					return {
						...edge,
						sourceHandle: newSourceHandle,
						targetHandle: newTargetHandle,
					};
				})
			);

			setNodes((nds: Node<CustomNode>[]) =>
				nds.map((node) => ({
					...node,
					data: {
						...node.data,
						columns: node.data.columns.map((col: Column) =>
							col.fk?.startsWith(`${oldTableName}.`)
								? { ...col, fk: col.fk.replace(`${oldTableName}.`, `${newTableName}.`) }
								: col
						),
					},
				}))
			);

			console.log('Table renamed:', { oldTableName, newTableName });
			setIsEditingTable(false);
			setError(null);
		} catch (e) {
			console.error('Table update failed:', e);
			setError('テーブルの更新に失敗しました。');
		}
	};

	const handleAddColumn = async () => {
		if (!newColumn.name || !setNodes) {
			console.error('カラム名が空またはsetNodesが定義されていません');
			setError('カラム名を入力してください。');
			return;
		}
		try {
			const createdColumn = await createColumn({
				tableId: id,
				name: newColumn.name,
				type: newColumn.type,
				constraints: newColumn.constraints,
			});

			setNodes((nds: Node<CustomNode>[]) =>
				nds.map((node) =>
					node.id === id
						? {
							...node,
							data: {
								...node.data,
								columns: [...node.data.columns, { ...newColumn, id: createdColumn.id.toString(), pk: newColumn.constraints.includes('PRIMARY_KEY') }],
							},
						}
						: node
				)
			);
			setNewColumn({ name: '', type: 'string', constraints: [], id: '' });
			setIsAddingColumn(false);
			setError(null);
		} catch (e) {
			console.error('Column creation failed:', e);
			setError('カラムの追加に失敗しました。');
		}
	};

	const handleEditColumn = (index: number) => {
		setEditingColumnIndex(index);
		setEditingColumn({ ...columns[index] });
	};

	const handleSaveColumn = async () => {
		if (!editingColumn || editingColumnIndex === null || !setNodes || !setEdges) {
			console.error('編集データが無効またはsetNodes/setEdgesが定義されていません');
			setError('内部エラーが発生しました。');
			return;
		}
		const oldColumnName = columns[editingColumnIndex].name;
		const newColumnName = editingColumn.name;

		try {
			await updateColumn(
				editingColumn.id,
				{
					name: editingColumn.name,
					type: editingColumn.type,
					constraints: editingColumn.constraints,
					comment: editingColumn.comment,
				}
			);

			setNodes((nds: Node<CustomNode>[]) =>
				nds.map((node) =>
					node.id === id
						? {
							...node,
							data: {
								...node.data,
								columns: node.data.columns.map((col: Column, i: number) =>
									i === editingColumnIndex ? { ...editingColumn, pk: editingColumn.constraints.includes('PRIMARY_KEY') } : col
								),
							},
						}
						: node
				)
			);

			setEdges((eds: any) =>
				eds.map((edge: any) => {
					let newSourceHandle = edge.sourceHandle;
					let newTargetHandle = edge.targetHandle;

					if (edge.sourceHandle === `${data.name}.${oldColumnName}`) {
						newSourceHandle = `${data.name}.${newColumnName}`;
					}
					if (edge.targetHandle === `${data.name}.${oldColumnName}`) {
						newTargetHandle = `${data.name}.${newColumnName}`;
					}

					return {
						...edge,
						sourceHandle: newSourceHandle,
						targetHandle: newTargetHandle,
					};
				})
			);

			setNodes((nds: Node<CustomNode>[]) =>
				nds.map((node) => ({
					...node,
					data: {
						...node.data,
						columns: node.data.columns.map((col: Column) =>
							col.fk === `${data.name}.${oldColumnName}`
								? { ...col, fk: `${data.name}.${newColumnName}` }
								: col
						),
					},
				}))
			);

			setEditingColumnIndex(null);
			setEditingColumn(null);
			setError(null);
		} catch (e) {
			console.error('Column update failed:', e);
			setError('カラムの更新に失敗しました。');
		}
	};

	const handleDeleteColumn = async (index: number) => {
		if (!setNodes || !setEdges) {
			console.error('setNodesまたはsetEdgesが定義されていません');
			setError('内部エラーが発生しました。');
			return;
		}
		const column = columns[index];

		try {
			await deleteColumn(column.id);

			setNodes((nds: Node<CustomNode>[]) =>
				nds.map((node) =>
					node.id === id
						? {
							...node,
							data: {
								...node.data,
								columns: node.data.columns.filter((_: any, i: number) => i !== index),
							},
						}
						: node
				)
			);

			setEdges((eds: Edge[]) =>
				eds.filter(
					(edge) =>
						edge.sourceHandle !== `${data.name}.${column.name}` &&
						edge.targetHandle !== `${data.name}.${column.name}`
				)
			);

			setNodes((nds: Node<CustomNode>[]) =>
				nds.map((node) => ({
					...node,
					data: {
						...node.data,
						columns: node.data.columns.map((col: Column) =>
							col.fk === `${data.name}.${column.name}` ? { ...col, fk: undefined } : col
						),
					},
				}))
			);

			setError(null);
		} catch (e) {
			console.error('Column deletion failed:', e);
			setError('カラムの削除に失敗しました。');
		}
	};

	const onDelete = useCallback(() => {
		// 親コンポーネント（ERDEditor）の onNodesDelete をトリガーするため、イベントを発火
		const deleteEvent = new CustomEvent('node:delete', { detail: { id } });
		window.dispatchEvent(deleteEvent);
	}, [id]);

	// ハンドルの位置を計算（カラムの高さに合わせる）
	const getHandleTop = (index: number) => {
		const baseOffset = 65; // テーブル名とパディングの高さ
		const columnHeight = 28; // 各カラムの<li>高さ（Tailwindのpy-1とフォントサイズに基づく）
		return baseOffset + index * columnHeight;
	};

	return (
		<div
			className="bg-white border border-gray-300 rounded-lg shadow-md p-4 min-w-[200px] max-w-[300px] cursor-pointer relative"
			onDoubleClick={() => setIsEditingTable(true)}
		>
			{error && (
				<div className="mb-2 p-2 bg-red-100 text-red-700 text-sm rounded">
					{error}
				</div>
			)}
			<button
				onClick={onDelete}
				className="absolute top-1 right-1 bg-red-500 text-white text-xs p-1 rounded-full hover:bg-red-600 transition"
				title="テーブルを削除"
			>
				✕
			</button>
			{/* テーブル名 */}
			<div className="flex justify-between items-center mb-2">
				{isEditingTable ? (
					<input
						type="text"
						value={tableName}
						onChange={(e) => setTableName(e.target.value)}
						onBlur={handleSaveTable}
						onKeyPress={(e) => e.key === 'Enter' && handleSaveTable()}
						autoFocus
						className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
					/>
				) : (
					<h3 className="text-lg font-semibold text-gray-800">{data.name}</h3>
				)}
			</div>
			{/* カラムリスト */}
			<ul className="text-sm text-gray-600">
				{columns.map((col: Column, index: number) => (
					<div key={col.id}>
						<Handle
							type="source"
							position={Position.Right}
							id={`${data.name}.${col.name}`}
							style={{ top: getHandleTop(index), background: '#2563eb', width: 8, height: 8 }}
						/>
						<Handle
							type="target"
							position={Position.Left}
							id={`${data.name}.${col.name}`}
							style={{ top: getHandleTop(index), background: '#2563eb', width: 8, height: 8 }}
						/>
						<li className="py-1 flex items-center space-x-2">
							{editingColumnIndex === index ? (
								<div className="flex flex-col w-full">
									<input
										type="text"
										value={editingColumn?.name || ''}
										onChange={(e) =>
											setEditingColumn({ ...editingColumn!, name: e.target.value })
										}
										placeholder="カラム名"
										className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-1"
									/>
									<select
										value={editingColumn?.type || 'string'}
										onChange={(e) =>
											setEditingColumn({ ...editingColumn!, type: e.target.value })
										}
										className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-1"
									>
										<option value="string">string</option>
										<option value="integer">integer</option>
										<option value="boolean">boolean</option>
									</select>
									<div className="flex items-center space-x-2 mb-1">
										<label className="flex items-center">
											<input
												type="checkbox"
												checked={editingColumn?.constraints.includes('PRIMARY_KEY')}
												onChange={(e) =>
													setEditingColumn({
														...editingColumn!,
														constraints: e.target.checked
															? [...editingColumn!.constraints, 'PRIMARY_KEY']
															: editingColumn!.constraints.filter((c) => c !== 'PRIMARY_KEY'),
													})
												}
												className="mr-1"
											/>
											PK
										</label>
									</div>
									<input
										type="text"
										value={editingColumn?.comment || ''}
										onChange={(e) =>
											setEditingColumn({ ...editingColumn!, comment: e.target.value })
										}
										placeholder="コメント"
										className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-1"
									/>
									<div className="flex space-x-2 mt-1">
										<button
											onClick={handleSaveColumn}
											className="bg-primary text-white px-2 py-1 rounded-md hover:bg-blue-700 transition"
										>
											保存
										</button>
										<button
											onClick={() => {
												setEditingColumnIndex(null);
												setEditingColumn(null);
											}}
											className="border border-gray-300 text-gray-600 px-2 py-1 rounded-md hover:bg-gray-100 transition"
										>
											キャンセル
										</button>
									</div>
								</div>
							) : (
								<>
									<span>
										{col.name} ({col.type}) {col.constraints.includes('PRIMARY_KEY') ? '[PK]' : ''} {col.fk ? `[FK: ${col.fk}]` : ''} {col.comment ? `// ${col.comment}` : ''}
									</span>
									<button
										onClick={() => handleEditColumn(index)}
										className="text-xs text-primary hover:underline"
									>
										編集
									</button>
									<button
										onClick={() => handleDeleteColumn(index)}
										className="text-xs text-red-500 hover:underline"
									>
										削除
									</button>
								</>
							)}
						</li>
					</div>
				))}
			</ul>
			{/* カラム追加 */}
			{isAddingColumn ? (
				<div className="mt-2">
					<input
						type="text"
						value={newColumn.name}
						onChange={(e) => setNewColumn({ ...newColumn, name: e.target.value })}
						placeholder="カラム名"
						className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-2"
					/>
					<select
						value={newColumn.type}
						onChange={(e) => setNewColumn({ ...newColumn, type: e.target.value })}
						className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-2"
					>
						<option value="string">string</option>
						<option value="integer">integer</option>
						<option value="boolean">boolean</option>
					</select>
					<div className="flex items-center space-x-2 mb-2">
						<label className="flex items-center">
							<input
								type="checkbox"
								checked={newColumn.constraints.includes('PRIMARY_KEY')}
								onChange={(e) =>
									setNewColumn({
										...newColumn,
										constraints: e.target.checked
											? [...newColumn.constraints, 'PRIMARY_KEY']
											: newColumn.constraints.filter((c) => c !== 'PRIMARY_KEY'),
									})
								}
								className="mr-1"
							/>
							PK
						</label>
					</div>
					<div className="flex space-x-2">
						<button
							onClick={handleAddColumn}
							className="bg-primary text-white px-3 py-1 rounded-md hover:bg-blue-700 transition"
						>
							保存
						</button>
						<button
							onClick={() => setIsAddingColumn(false)}
							className="border border-gray-300 text-gray-600 px-3 py-1 rounded-md hover:bg-gray-100 transition"
						>
							キャンセル
						</button>
					</div>
				</div>
			) : (
				<button
					onClick={() => setIsAddingColumn(true)}
					className="mt-2 text-sm text-primary hover:underline"
				>
					カラム追加
				</button>
			)}
		</div>
	);
};

export default CustomTableNode;