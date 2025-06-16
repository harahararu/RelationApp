'use client';

import { useCallback, useState, useEffect } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Node,
    Edge,
    Connection,
} from '@xyflow/react';
import CustomTableNode from './CustomTableNode';
import CustomRelationshipEdge from './CustomRelationshipEdge';
import { createEdge, updateEdge, deleteEdge, removeTableFromProject } from './actions';
import { Table, Column } from '@/types/types';
import { useRouter } from 'next/navigation';
import SidebarMenu from './SidebarMenu';

const nodeTypes = { table: CustomTableNode };
const edgeTypes = { relationship: CustomRelationshipEdge };

interface ERDEditorProps {
    initialNodes: Node[];
    initialEdges: Edge[];
    projectId: number;
    availableTables: { id: number; name: string; columns: { name: string; type: string, constraints: string[], comment: string | null }[] }[];
}

const ERDEditor: React.FC<ERDEditorProps> = ({ initialNodes, initialEdges, projectId }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    
    
    const [error, setError] = useState<string | null>(null);
    const [editingEdge, setEditingEdge] = useState<Edge | null>(null);
    
    const router = useRouter();

    const mappedNodes = nodes.map((node) => ({
        ...node,
        data: {
            ...node.data,
            setNodes,
            setEdges,
            nodes,
            projectId,
        },
    }));

    const onConnect = useCallback(
        async (params: Connection) => {
            if (!params.sourceHandle || !params.targetHandle) {
                console.error('無効なハンドルID:', params);
                setError('無効な接続です。');
                return;
            }
            const sourceNode = nodes.find((n) => n.id === params.source);
            const targetNode = nodes.find((n) => n.id === params.target);
            if (!sourceNode || !targetNode) {
                setError('ノードが見つかりません。');
                return;
            }

            const sourceColumnName = params.sourceHandle.split('.')[1];
            const targetColumnName = params.targetHandle.split('.')[1];

            const sourceColumn = sourceNode.data.columns.find((c: Column) => c.name === sourceColumnName);
            const targetColumn = targetNode.data.columns.find((c: Column) => c.name === targetColumnName);

            if (!sourceColumn || !targetColumn) {
                setError('カラムが見つかりません。');
                return;
            }

            try {
                const newEdge = await createEdge({
                    projectId,
                    sourceTableId: params.source!,
                    sourceColumnId: sourceColumn.id,
                    targetTableId: params.target!,
                    targetColumnId: targetColumn.id,
                    type: '1:N',
                });

                setEdges((eds) =>
                    addEdge(
                        {
                            ...params,
                            id: newEdge.id.toString(),
                            type: 'relationship',
                            data: { cardinality: newEdge.type },
                        },
                        eds
                    )
                );
                console.log(edges, newEdge)
                setError(null);
            } catch (e) {
                console.error('Edge creation failed:', e);
                setError('エッジの作成に失敗しました。');
            }
        },
        [nodes, setEdges, projectId]
    );

    const handleEdgeEdit = async (edgeId: string, newCardinality: string) => {
        try {
            await updateEdge(edgeId, { type: newCardinality });
            setEdges((eds) =>
                eds.map((edge) =>
                    edge.id === edgeId ? { ...edge, data: { ...edge.data, cardinality: newCardinality } } : edge
                )
            );
            setEditingEdge(null);
            setError(null);
        } catch (e) {
            console.error('Edge update failed:', e);
            setError('エッジの更新に失敗しました。');
        }
    };

    const handleDeleteEdge = async (edgeId: string) => {
        console.log(edgeId)
        try {
            await deleteEdge(edgeId);
            setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
            setEditingEdge(null);
            setError(null);
        } catch (e) {
            console.error('Edge deletion failed:', e);
            setError('エッジの削除に失敗しました。');
        }
    };

    const onNodesDelete = useCallback(async (deleted: Node[]) => {
        for (const node of deleted) {
            if (node.type === 'table') {
                const formData = new FormData();
                formData.append('id', node.id);
                formData.append('projectId', projectId.toString());
                try {
                    const result = await removeTableFromProject(formData);
                    if (result.success) {
                        setNodes((nds) => nds.filter((n) => n.id !== node.id));
                        setEdges((eds) => eds.filter((e) => e.source !== node.id && e.target !== node.id));
                    } else {
                        alert(result.errors?._form[0]);
                    }
                } catch (error) {
                    console.error('テーブル削除に失敗しました:', error);
                    alert('テーブル削除に失敗しました');
                }
            }
        }
    }, [projectId, setNodes, setEdges]);

    const addNewTadleNode = (newTable: Table) => {
        setNodes((nds) => [
            ...nds,
            {
                id: newTable.id.toString(),
                type: 'table',
                position: { x: Math.random() * 500, y: Math.random() * 500 },
                data: { name: newTable.name, columns: newTable.columns },
            },
        ]);
    }

    // カスタム削除イベントのリスナー
    useEffect(() => {
        const handleNodeDelete = (event: Event) => {
            const customEvent = event as CustomEvent<{ id: string }>;
            const nodeId = customEvent.detail.id;
            const nodeToDelete = nodes.find((node) => node.id === nodeId);
            if (nodeToDelete) {
                onNodesDelete([nodeToDelete]);
            }
        };

        window.addEventListener('node:delete', handleNodeDelete);
        return () => {
            window.removeEventListener('node:delete', handleNodeDelete);
        };
    }, [nodes, onNodesDelete]);

    return (
        <div className="h-screen flex">
            <SidebarMenu 
                projectId={projectId}
                setNodes={setNodes}
            />
            <div className="flex-1 flex flex-col">
                {error && (
                    <div className="p-4 bg-red-100 text-red-700 text-sm">
                        {error}
                    </div>
                )}
                <ReactFlow
                    nodes={mappedNodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodesDelete={onNodesDelete}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    onEdgeClick={(_, edge) => setEditingEdge(edge)}
                    fitView
                >
                    <Controls />
                    <Background />
                </ReactFlow>

            </div>
            {editingEdge && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50">
                    <h3 className="text-lg font-semibold mb-2">エッジ編集</h3>
                    <select
                        value={editingEdge.data?.cardinality as string[]}
                        onChange={(e) => handleEdgeEdit(editingEdge.id, e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-2"
                    >
                        <option value="1:N">1:N</option>
                        <option value="1:1">1:1</option>
                        <option value="N:N">N:N</option>
                    </select>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleDeleteEdge(editingEdge.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
                        >
                            削除
                        </button>
                        <button
                            onClick={() => setEditingEdge(null)}
                            className="border border-gray-300 text-gray-600 px-3 py-1 rounded-md hover:bg-gray-100 transition"
                        >
                            閉じる
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ERDEditor;