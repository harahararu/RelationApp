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

  return (
    <div className="container mx-auto p-4">
      <SearchForm
        tables={initialData}
        onSearch={(data, error) => {
          if (error) {
            console.error(error);
            setSearchResults([]);
          } else {
            setSearchResults(data || []);
          }
        }}
      />

      <RelatedDataTabs relations={relations} initialData={searchResults} />
    </div>
  );
}