// components/DataTable.tsx
import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  Header,
  FilterFn,
} from '@tanstack/react-table';
import { ChevronsUpDown } from 'lucide-react';

// カスタムフィルタ関数
export const dateRangeFilterFn: FilterFn<unknown> = (row, columnId, filterValue) => {
  const [start, end] = filterValue as [string | undefined, string | undefined] ?? [undefined, undefined];
  const cellValue = row.getValue(columnId) as Date;
  if (!start && !end) return true;
  if (start && cellValue < new Date(start)) return false;
  if (end && cellValue > new Date(end)) return false;
  return true;
};

export const numberRangeFilterFn: FilterFn<unknown> = (row, columnId, filterValue) => {
  const [min, max] = filterValue as [number | undefined, number | undefined] ?? [undefined, undefined];
  const cellValue = row.getValue(columnId) as number;
  if (!min && !max) return true;
  if (min !== undefined && cellValue < min) return false;
  if (max !== undefined && cellValue > max) return false;
  return true;
};

type DataTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];  // unknown で型エラー回避
  pageSize?: number;
};

export function DataTable<TData>({
  data,
  columns,
  pageSize = 20,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),  // Faceted 必須
    getFacetedUniqueValues: getFacetedUniqueValues(),  // Faceted 必須
    initialState: { pagination: { pageSize } },
  });

  return (
    <div className="p-6">
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-4 py-3 text-left align-top">
                    <DataTableHeader header={header} />
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-16 text-gray-500">
                  データがありません
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ページネーション */}
      <div className="mt-6 flex items-center justify-between text-sm">
        <div className="text-gray-600">
          全 {table.getFilteredRowModel().rows.length} 件中 {table.getRowModel().rows.length} 件表示
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            前へ
          </button>
          <span className="font-medium">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            次へ
          </button>
        </div>
      </div>
    </div>
  );
}

// ヘッダー（Faceted Filter 復活 + 範囲フィルタ対応）
function DataTableHeader<TData>({ header }: { header: Header<TData, unknown> }) {
  const column = header.column;
  const filterValue = column.getFilterValue();
  const facetedValues = column.getFacetedUniqueValues();  // Faceted 値取得
  const filterVariant = column.columnDef.meta?.filterVariant as 'text' | 'range' | 'date' | undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {/* ヘッダー名 + ソート */}
      <button
        className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900"
        onClick={column.getToggleSortingHandler()}
      >
        {flexRender(column.columnDef.header, header.getContext())}
        <ChevronsUpDown className="w-3.5 h-3.5" />
      </button>

      {/* フィルタエリア */}
      {column.getCanFilter() && (
        <div className="text-xs">
          {filterVariant === 'range' ? (
            // 数値範囲（age用）
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={((filterValue as [number | undefined, number | undefined])?.[0] ?? '')}
                onChange={e =>
                  column.setFilterValue((old: [number | undefined, number | undefined]) => [
                    e.target.value ? Number(e.target.value) : undefined,
                    old?.[1],
                  ])
                }
                placeholder="最小"
                className="w-16 px-2 py-1 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-gray-400">~</span>
              <input
                type="number"
                value={((filterValue as [number | undefined, number | undefined])?.[1] ?? '')}
                onChange={e =>
                  column.setFilterValue((old: [number | undefined, number | undefined]) => [
                    old?.[0],
                    e.target.value ? Number(e.target.value) : undefined,
                  ])
                }
                placeholder="最大"
                className="w-16 px-2 py-1 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          ) : filterVariant === 'date' ? (
            // 日付範囲（registeredAt用）
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={((filterValue as [string | undefined, string | undefined])?.[0] ?? '')}
                onChange={e =>
                  column.setFilterValue((old: [string | undefined, string | undefined]) => [
                    e.target.value || undefined,
                    old?.[1],
                  ])
                }
                className="px-2 py-1 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-gray-400">~</span>
              <input
                type="date"
                value={((filterValue as [string | undefined, string | undefined])?.[1] ?? '')}
                onChange={e =>
                  column.setFilterValue((old: [string | undefined, string | undefined]) => [
                    old?.[0],
                    e.target.value || undefined,
                  ])
                }
                className="px-2 py-1 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          ) : facetedValues && facetedValues.size > 0 && facetedValues.size <= 20 ? (
            // Faceted Filter（role/status用：ユニーク値ボタン）
            <div className="flex flex-wrap gap-1 mt-1">
              {Array.from(facetedValues.entries())
                .sort(([a], [b]) => String(a).localeCompare(String(b)))
                .slice(0, 8)
                .map(([value, count]) => {
                  const strValue = String(value);
                  const isActive = (filterValue as string) === strValue;
                  return (
                    <button
                      key={strValue}
                      onClick={() => column.setFilterValue(isActive ? undefined : strValue)}
                      className={`px-2 py-0.5 rounded text-xs font-medium transition ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {strValue || '(空)'} ({count})
                    </button>
                  );
                })}
              {facetedValues.size > 8 && <span className="text-gray-500 text-xs">…</span>}
            </div>
          ) : (
            // テキスト検索（デフォルト）
            <input
              type="text"
              value={(filterValue as string) ?? ''}
              onChange={e => column.setFilterValue(e.target.value || undefined)}
              placeholder="検索..."
              className="w-full px-2 py-1 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          )}
        </div>
      )}
    </div>
  );
}