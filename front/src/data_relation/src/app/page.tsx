'use client';

import { DataTable, dateRangeFilterFn, numberRangeFilterFn } from '@/components/Table';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';


type User = {
  id: number;
  name: string;
  email: string;
  age: number;
  role: 'admin' | 'user' | 'guest';
  status: 'active' | 'inactive' | 'banned';
  registeredAt: Date;
};
const columnHelper = createColumnHelper<User>();

export default function Home() {
  const data: User[] = Array.from({ length: 300 }, (_, i) => ({
    id: i + 1,
    name: `ユーザー${i + 1}`,
    email: `user${i + 1}@example.com`,
    age: 18 + (i % 70),
    role: ['admin', 'user', 'guest'][i % 3] as const,
    status: ['active', 'inactive', 'banned'][i % 3] as const,
    registeredAt: new Date(2020 + Math.floor(i / 100), i % 12, (i % 28) + 1),
  }));
  
  const columnHelper = createColumnHelper<User>();
  
  const columns = [
    columnHelper.accessor('name', { header: '名前' }),
    columnHelper.accessor('email', { header: 'メール' }),
    columnHelper.accessor('age', {
      header: '年齢',
      filterFn: numberRangeFilterFn,
      meta: { filterVariant: 'range' },
    }),
    columnHelper.accessor('role', { header: '権限' }),
    columnHelper.accessor('registeredAt', {
      header: '登録日',
      cell: info => (info.getValue() as Date).toLocaleDateString('ja-JP'),
      filterFn: dateRangeFilterFn,
      meta: { filterVariant: 'date' },
    }),
  ] as ColumnDef<User>[];  // ← ここでキャスト（エラー解決！）


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Link href="/erd" className="bg-primary text-black px-6 py-3 rounded-md hover:bg-blue-700 transition">
        ERDエディタを開く
      </Link>
      <DataTable data={data} columns={columns} pageSize={20} />;
    </div>
  );
}