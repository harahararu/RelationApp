export interface Database {
    name: string;
    dbms: string;
    host: string;
    port: number | null;
    databaseName: string;
    username: string;
    password: string;
}

export interface Column {
    id: number;
    name: string;
    type: string;
    constraints: string[];
    comment?: string;
}

export interface Table {
    id: number;
    name: string;
    columns: Column[];
}

export interface TableSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    tables: Table[];
    onSelectTable: (table: Table) => void;
    selectedTable: Table | null;
    onAddTable: (tableId: number) => void;
}