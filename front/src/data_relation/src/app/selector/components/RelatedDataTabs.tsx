'use client';

import { useState, useTransition } from 'react';
import SearchResults from './SearchResults';
import { Relation } from './SelectorClient';
import { searchRelationData } from './actioins';


interface RelatedDataTabsProps {
    relations: Relation[];
    initialData: any[];
    tableId?: number | null;
}

export default function RelatedDataTabs({ relations, initialData, tableId }: RelatedDataTabsProps) {
    const [activeTab, setActiveTab] = useState<'initial' | 'related'>('initial');
    const [relatedData, setRelatedData] = useState<any[]>([]);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleRelationSearch = async (relationId: number) => {
        if (!tableId) {
            setError('Table ID is missing');
            return;
        }
        
        startTransition(async () => {
            setError(null);
            const formData = new FormData();
            formData.append('relationId', relationId.toString());

            const { data, columns, error } = await searchRelationData(formData, initialData, tableId);
            if (error) {
                setError(error);
            } else {
                console.log('Relation search result:', { data, columns });
                setRelatedData(data || []);
                setActiveTab('related');
            }
        });
    };

    return (
        <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">データ探索</h2>
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setActiveTab('initial')}
                    className={`p-2 ${activeTab === 'initial' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    disabled={isPending}
                >
                    初期データ
                </button>
                <button
                    onClick={() => setActiveTab('related')}
                    className={`p-2 ${activeTab === 'related' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    disabled={isPending}
                >
                    関連データ
                </button>
            </div>
            {activeTab === 'related' && (
                <select
                    onChange={(e) => handleRelationSearch(parseInt(e.target.value))}
                    className="border p-2 mb-4 w-full"
                    disabled={isPending || !tableId}
                >
                    <option value="">リレーションを選択</option>
                    {relations.map((rel) => (rel.sourceTable.id === tableId || rel.targetTable.id === tableId) && (
                        <option key={rel.id} value={rel.id}>
                            {rel.sourceTable.id === tableId
                            ? `${rel.sourceTable.name}.${rel.sourceColumn.name} → ${rel.targetTable.name}.${rel.targetColumn.name}`
                            : `${rel.targetTable.name}.${rel.targetColumn.name} → ${rel.sourceTable.name}.${rel.sourceColumn.name}`}
                            ({rel.type})
                        </option>
                    ))}
                </select>
            )}
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <SearchResults data={activeTab === 'initial' ? [...initialData] : relatedData} />
        </div>
    );
}