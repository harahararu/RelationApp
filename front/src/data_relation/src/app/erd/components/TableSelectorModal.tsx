'use client';

import Button from '@/components/Button';
import { Table } from '@/types/types';

interface TableSelectorModalProps {
    table: Table | null;
    handleAddTables: Function;
}

export interface DatabaseNames {
  id: number;
  name: string;
}

export default function TableSelectorModal({
    table,
    handleAddTables
}: TableSelectorModalProps) {

    return (
        <div className="flex space-x-4 mt-4">
            <div className="">
                {table ? (
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">
                            {table.name} のプレビュー
                        </h3>
                        {table.columns.length > 0 ? (
                            <table className="min-w-full bg-white rounded-lg shadow-md">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">名前</th>
                                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">型</th>
                                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">制約</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {table.columns.map((col) => (
                                        <tr key={col.name} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 text-sm text-gray-900">{col.name}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900">{col.type}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900">{col.constraints}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-sm text-gray-600">カラムがありません</p>
                        )}
                        <Button
                            onClick={() => handleAddTables()}
                            variant="primary"
                            className="mt-4"
                        >
                            このテーブルを追加
                        </Button>
                    </div>
                ) : (
                    <p className="text-sm text-gray-600">テーブルを選択してください</p>
                )}
            </div>
        </div>
    );
}