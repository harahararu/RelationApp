'use client';

import { DataTable, dateRangeFilterFn, numberRangeFilterFn } from '@/components/Table';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';


type Role = {
  name: 'admin' | 'user' | 'guest';
  label: string;
  level: number;  // 99=管理者, 50=ユーザー, 10=ゲスト
};

type User = {
  id: number;
  name: string;
  email: string;
  age: number;
  role: Role;  // リッチオブジェクト復活
  registeredAt: Date;
};

const roleOptions: Role[] = [
  { name: 'admin', label: '管理者', level: 99 },
  { name: 'user', label: '一般ユーザー', level: 50 },
  { name: 'guest', label: 'ゲスト', level: 10 },
];

export default function Home() {
  const data: User[] = Array.from({ length: 300 }, (_, i) => {
    const roleIndex = i % 3;
    return {
      id: i + 1,
      name: `ユーザー${i + 1}`,
      email: `user${i + 1}@example.com`,
      age: 18 + (i % 65),
      role: roleOptions[roleIndex],
      registeredAt: new Date(2020, 0, 1 + (i % 365)),
    };
  });

  const columnHelper = createColumnHelper<User>();
  
  const columns = [
    columnHelper.accessor('name', { header: '名前' }),
    columnHelper.accessor('email', { header: 'メール' }),
    columnHelper.accessor('age', {
      header: '年齢',
      filterFn: numberRangeFilterFn,
      meta: { filterVariant: 'range' },
    }),
    // ここを修正！ accessorFn で role.name を返す
    columnHelper.accessor(row => row.role.name, {
      id: 'role', // id必須（Facetedが正しく動くように）
      header: '権限',
      // cell でリッチ表示（label + level + 色）
      cell: info => {
        const role = info.row.original.role; // 元のオブジェクト取得
        const colorClass = 
          role.level >= 99 ? 'bg-red-100 text-red-800 border-red-300' :
          role.level >= 50 ? 'bg-blue-100 text-blue-800 border-blue-300' :
          'bg-gray-100 text-gray-800 border-gray-300';
        
        return (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${colorClass}`}>
            <span>{role.label}</span>
            <span className="text-xs opacity-70">Lv.{role.level}</span>
          </div>
        );
      },
      // ソートも name で
      sortingFn: (a, b) => a.original.role.level > b.original.role.level ? 1 : -1,
    }),
    columnHelper.accessor('registeredAt', {
      header: '登録日',
      cell: info => (info.getValue() as Date).toLocaleDateString('ja-JP'),
      filterFn: dateRangeFilterFn,
      meta: { filterVariant: 'date' },
    }),
  ] as ColumnDef<User, unknown>[];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Link href="/erd" className="bg-primary text-black px-6 py-3 rounded-md hover:bg-blue-700 transition">
        ERDエディタを開く
      </Link>
      <DataTable data={data} columns={columns} pageSize={20} />;
    </div>
  );
}