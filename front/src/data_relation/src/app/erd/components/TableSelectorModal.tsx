'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import Button from '@/components/Button';
import Select from 'react-select';
import { Database, Table } from '@/types/types';
import { getDatabases, getTables, registerTablesToProject } from './actions';
import { fetchTablesFromDatabase } from './actions'
import { useRouter } from 'next/navigation';

interface TableSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  // onSelectTable: (table: Table) => void;
  // selectedTable: Table | null;
  onAddTable: (tableId: number) => void;
  projectId: number;
}

export default function TableSelectorModal({
  isOpen,
  onClose,
  // onSelectTable,
  // selectedTable,
  onAddTable,
  projectId
}: TableSelectorModalProps) {
  const [databases, setDatabases] = useState<Database[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<Database | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDatabases = async () => {
      const data = await getDatabases();
      setDatabases(data);
    };
    fetchDatabases();
  }, []);

  const handleSelectTable = (table: Table) => {
    setSelectedTable(table);
  };

  const handleSelectDatabase = async (database: Database | null) => {
    setSelectedDatabase(database);
    setTables([]);
    setSelectedTable(null);
    if (database) {
      const data = await fetchTablesFromDatabase(database.id);
      setTables(data);
    }
  };

  const handleAddTables = async (projectId: number) => {
    if (!selectedDatabase || !selectedTable) {
      alert('データベースとテーブルを選択してください');
      return;
    }

    const result = await registerTablesToProject(selectedDatabase.id, projectId, selectedTable);

    if (result.success) {
      alert(result.message);
      onClose();
      router.refresh();
    } else {
      alert(result.message);
    }
  };

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
              <div className="mt-4">
                {/* データベース選択 */}
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  データベース
                </label>
                <Select
                  options={databases}
                  getOptionLabel={(option: Database) => option?.name}
                  getOptionValue={(option: Database) => option?.id.toString()}
                  onChange={(option: Database) => handleSelectDatabase(option)}
                  placeholder="データベースを選択..."
                  isClearable
                  className="mb-4"
                />
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  テーブル
                </label>
                <Select
                  options={tables}
                  getOptionLabel={(option: Table) => option.name}
                  getOptionValue={(option: Table) => option.id.toString()}
                  onChange={(option: Table) => handleSelectTable(option as Table)}
                  placeholder="テーブルを選択..."
                  isClearable
                  className="mb-4"
                />
              </div>
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
                    onClick={() => handleAddTables(projectId)}
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