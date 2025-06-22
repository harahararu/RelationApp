'use client';

import { useMemo } from 'react';
import { useReactTable, getCoreRowModel, ColumnDef } from '@tanstack/react-table';

interface Record {
  [key: string]: any;
}
interface SearchResultsProps {
  data: Record[];
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString().split('T')[0]; // 日付をYYYY-MM-DD形式に
  if (typeof value === 'object') return JSON.stringify(value); // オブジェクトや配列を文字列化
  return value.toString(); // プリミティブ型を文字列化
}

export default function SearchResults({ data }: SearchResultsProps) {
  const columns = useMemo<ColumnDef<Record>[]>(
    () =>
      data.length > 0
        ? Object.keys(data[0]).map((key) => {
          return({
            header: key,
            accessorKey: key,
          })})
        : [],
    [data]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id} className="border border-gray-300 p-2 bg-gray-100">
                {header.isPlaceholder ? null : header.column.columnDef.header as string}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="border border-gray-300 p-2">
                {formatValue(cell.getValue())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}