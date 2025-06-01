'use client';

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import Button from '@/components/Button';

interface Column {
  name: string;
  type: string;
  constraints: string;
  comment?: string | null;
}

interface Table {
  id: number;
  name: string;
  columns: Column[];
}

interface TableSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: Table[];
  onSelectTable: (table: Table) => void;
  selectedTable: Table | null;
  onAddTable: (tableId: number) => void;
}

export default function TableSelectorModal({
  isOpen,
  onClose,
  tables,
  onSelectTable,
  selectedTable,
  onAddTable,
}: TableSelectorModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6">
          <DialogTitle className="text-lg font-semibold text-gray-800">
            テーブルを選択
          </DialogTitle>
          <div className="flex space-x-4 mt-4">
            <div className="w-1/2">
              {tables.length > 0 ? (
                <ul className="max-h-96 overflow-y-auto bg-white border rounded-lg">
                  {tables.map((table) => (
                    <li
                      key={table.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => onSelectTable(table)}
                    >
                      {table.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600">利用可能なテーブルがありません</p>
              )}
            </div>
            <div className="w-1/2">
              {selectedTable ? (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    {selectedTable.name} のプレビュー
                  </h3>
                  {selectedTable.columns.length > 0 ? (
                    <table className="min-w-full bg-white rounded-lg shadow-md">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">名前</th>
                          <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">型</th>
                          <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">制約</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTable.columns.map((col) => (
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
                    onClick={() => onAddTable(selectedTable.id)}
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
          <Button onClick={onClose} variant="secondary" className="mt-4">
            キャンセル
          </Button>
        </DialogPanel>
      </div>
    </Dialog>
  );
}