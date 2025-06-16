'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/Button';
import { Table } from '@/types/types';
import { getDatabases, registerTablesToProject } from './actions';
import { fetchTableNamesFromDatabase, fetchTableFromDatabase } from './actions';
import TableSelectorModal from './TableSelectorModal';
import { useRouter } from 'next/navigation';
import { useModal } from '@/hooks/useModal';

interface TableSelectorModalProps {
    projectId: number;
    addNewTableNode: Function;
    isLoading: boolean;
}

export interface DatabaseNames {
    id: number;
    name: string;
}

const AddDbTable = ({
    projectId,
    addNewTableNode,
    isLoading
}: TableSelectorModalProps) => {
    const [ModalWrapper, openModal, closeModal] = useModal();
    
    const [databases, setDatabases] = useState<DatabaseNames[]>([]);
    const [selectedDatabase, setSelectedDatabase] = useState<DatabaseNames | null>(null);
    const [tables, setTables] = useState<string[]>([]);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchDatabases = async () => {
            const data = await getDatabases();
            setDatabases(data);
        };
        fetchDatabases();
    }, []);

    const handleSelectTable = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const tableName = event.target.value;
        if (selectedDatabase && tableName) {
            const data = await fetchTableFromDatabase(selectedDatabase.id, tableName);
            setSelectedTable(data);
        }
    };

    const handleSelectDatabase = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const dbId = event.target.value;
        const database = databases.find(db => db.id.toString() === dbId) || null;
        setSelectedDatabase(database);
        setTables([]);
        setSelectedTable(null);
        if (database) {
            const data = await fetchTableNamesFromDatabase(database.id);
            setTables(data);
        }
    };

    const handleAddTables = async () => {
        if (!selectedDatabase || !selectedTable) {
            alert('データベースとテーブルを選択してください');
            return;
        }

        const result = await registerTablesToProject(selectedDatabase.id, projectId, selectedTable);

        if (result.success) {
            addNewTableNode(result.post);
            alert(result.message);
            closeModal();
            router.refresh();
        } else {
            alert(result.message);
        }
    };

    return (
        <div className="flex space-x-4 mt-4">
            <div className="w-full">
                <div className="mt-4">
                    {/* データベース選択 */}
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        データベース
                    </label>
                    <select
                        value={selectedDatabase?.id.toString() || ''}
                        onChange={handleSelectDatabase}
                        className="mb-4 w-full border border-gray-300 rounded-md p-2"
                        disabled={isLoading}
                    >
                        <option value="" disabled>データベースを選択...</option>
                        {databases.map(db => (
                            <option key={db.id} value={db.id.toString()}>
                                {db.name}
                            </option>
                        ))}
                    </select>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        テーブル
                    </label>
                    <select
                        value={selectedTable?.name || ''}
                        onChange={handleSelectTable}
                        className="mb-4 w-full border border-gray-300 rounded-md p-2"
                        disabled={isLoading}
                    >
                        <option value="" disabled>テーブルを選択...</option>
                        {tables.map(table => (
                            <option key={`${table}`} value={table}>
                                {table}
                            </option>
                        ))}
                    </select>
                    {selectedTable && 
                        <Button
                            onClick={openModal}
                            color="primary"
                            className="w-full mt-2"
                            disabled={isLoading}
                        >
                            プレビュー
                        </Button>
                    }
                </div>
            </div>
            <ModalWrapper
                title="テーブル選択"
                size="lg"
                disableOverlayClick={false}
                className="max-h-[80vh] overflow-y-auto"
            >
                <TableSelectorModal
                    table={selectedTable}
                    handleAddTables={handleAddTables}
                />
            </ModalWrapper>
        </div>
    );
}

export default AddDbTable;