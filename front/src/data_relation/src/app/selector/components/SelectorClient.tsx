'use client';

import SearchForm from '../components/SearchForm';
import RelatedDataTabs from '../components/RelatedDataTabs';
import { useState } from 'react';

export interface Table {
  id: number;
  name: string;
  databaseId: number;
  columns: { id: number; name: string; type: string; constraints: string[]; comment: string | null }[];
}

export interface Relation {
  id: number;
  sourceTable: { id: number; name: string };
  targetTable: { id: number; name: string };
  sourceColumn: { id: number; name: string };
  targetColumn: { id: number; name: string };
  type: string;
}

export default function SelectorPageClient({
  initialData,
  relations,
}: {
  initialData: Table[];
  relations: Relation[];
}) {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [tableId, setTableId] = useState<number | null>(null);

  return (
    <div className="container mx-auto p-4">
      <SearchForm
        tables={initialData}
        onSearch={(data, error, tableId) => {
          if (error) {
            console.error(error);
            setSearchResults([]);
            setTableId(null);
          } else {
            setSearchResults(data || []);
            console.log(tableId)
            setTableId(tableId);
          }
        }}
      />

      <RelatedDataTabs relations={relations} initialData={searchResults} tableId={tableId}/>
    </div>
  );
}