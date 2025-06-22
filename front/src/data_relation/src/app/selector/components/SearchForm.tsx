'use client';

import { useState, useTransition } from 'react';
import { searchTableData } from './actioins';
import { Table } from './SelectorClient';

interface SearchFormProps {
    tables: Table[];
    onSearch: (data: any[] | null, error: string | null) => void;
}

export default function SearchForm({ tables, onSearch }: SearchFormProps) {
    const [tableId, setTableId] = useState('');
    const [conditions, setConditions] = useState([{ column: '', operator: '=', value: '' }]);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const selectedTable = tables.find((t) => t.id === parseInt(tableId));

    const handleSearch = async () => {
        startTransition(async () => {
            setError(null);
            if (!tableId) {
                setError('テーブルを選択してください');
                return;
            }
            const formData = new FormData();
            formData.append('tableId', tableId);
            formData.append('conditions', JSON.stringify(conditions));

            const { data, error } = await searchTableData(formData);
            if (error) {
                console.log(error)
                setError(error);
            }

            onSearch(data, error);
        });
    };

    const addCondition = () => {
        setConditions([...conditions, { column: '', operator: '=', value: '' }]);
    };

    return (
        <div className="p-4 bg-white rounded shadow mb-4">
            <h3 className="text-lg font-semibold mb-2">データ検索</h3>
            <select
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
                className="border p-2 mb-4 w-full"
                disabled={isPending}
            >
                <option value="">テーブルを選択</option>
                {tables.map((table) => (
                    <option key={table.id} value={table.id}>
                        {table.name}
                    </option>
                ))}
            </select>
            {conditions.map((cond, index) => (
                <div key={index} className="flex gap-2 mb-2">
                    <select
                        value={cond.column}
                        onChange={(e) => {
                            const newConditions = [...conditions];
                            newConditions[index].column = e.target.value;
                            setConditions(newConditions);
                        }}
                        className="border p-2"
                        disabled={isPending}
                    >
                        <option value="">カラムを選択</option>
                        {selectedTable?.columns.map((col) => (
                            <option key={col.id} value={col.name}>
                                {col.name} ({col.type})
                            </option>
                        ))}
                    </select>
                    <select
                        value={cond.operator}
                        onChange={(e) => {
                            const newConditions = [...conditions];
                            newConditions[index].operator = e.target.value;
                            setConditions(newConditions);
                        }}
                        className="border p-2"
                        disabled={isPending}
                    >
                        <option value="=">=</option>
                        <option value="LIKE">LIKE</option>
                        <option value=">">{">"}</option>
                        <option value="<">{"<"}</option>
                    </select>
                    <input
                        type="text"
                        value={cond.value}
                        onChange={(e) => {
                            const newConditions = [...conditions];
                            newConditions[index].value = e.target.value;
                            setConditions(newConditions);
                        }}
                        placeholder="値を入力"
                        className="border p-2 flex-1"
                        disabled={isPending}
                    />
                </div>
            ))}
            <button
                onClick={addCondition}
                className="bg-blue-500 text-white p-2 rounded"
                disabled={isPending}
            >
                条件を追加
            </button>
            <button
                onClick={handleSearch}
                className="bg-green-500 text-white p-2 rounded ml-2"
                disabled={isPending}
            >
                {isPending ? '検索中...' : 'データ検索'}
            </button>
            {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
    );
}