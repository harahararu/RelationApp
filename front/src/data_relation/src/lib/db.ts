import { Pool } from 'pg';
import oracledb from 'oracledb';
import mysql from 'mysql2/promise';

interface DatabaseConfig {
    dbms: string | null;
    host: string;
    port: number | null;
    databaseName: string;
    username: string;
    password: string;
}

const pools: { [key: string]: any } = {};

export async function getConnection(database: DatabaseConfig) {
    const key = `${database.dbms}:${database.host}:${database.port}:${database.databaseName}`;
    if (!pools[key]) {
        switch (database.dbms?.toLowerCase()) {
            case 'postgresql':
                pools[key] = new Pool({
                    host: database.host,
                    port: database.port??5432,
                    database: database.databaseName,
                    user: database.username,
                    password: database.password,
                });
                break;
            case 'mysql':
                pools[key] = mysql.createPool({
                    host: database.host,
                    port: database.port??3306,
                    database: database.databaseName,
                    user: database.username,
                    password: database.password,
                });
                break;
            case 'oracle':
                pools[key] = await oracledb.createPool({
                    poolAlias: key,
                    user: database.username,
                    password: database.password,
                    connectString: `${database.host}:${database.port}/${database.databaseName}`,
                    poolMin: 1,
                    poolMax: 10,
                    poolTimeout: 60,
                });
                break;
            default:
                throw new Error(`Unsupported database dbms: ${database.dbms}`);
        }
    }
    return pools[key];
}

export async function queryDatabase(
    connection: any,
    dbms: string | null,
    query: string,
    values: any[] = []
) {
    switch (dbms?.toLowerCase()) {
        case 'postgresql':
            const pgResult = await connection.query(query, values);
            return {
                rows: pgResult.rows,
                columns: pgResult.fields ? pgResult.fields.map((field: any) => field.name) : [],
            };
        case 'mysql':
            const [mysqlRows, mysqlFields] = await connection.execute(query, values);
            return {
                rows: mysqlRows as any[],
                columns: mysqlFields ? mysqlFields.map((field: any) => field.name) : [],
            };
        case 'oracle':
            const oracleConnection = await connection.getConnection();
            try {  
                
                const oracleResult = await oracleConnection.execute(query, values, { outFormat: oracledb.OUT_FORMAT_OBJECT });
                return {
                    rows: oracleResult.rows || [],
                    columns: oracleResult.metaData ? oracleResult.metaData.map((meta: any) => meta.name) : [],
                };
            } finally {
                await oracleConnection.close();
            }
        default:
            throw new Error(`Unsupported database type: ${dbms}`);
    }
}

export function sanitizeIdentifier(identifier: string, dbms: string | null) {
    switch (dbms?.toLowerCase()) {
        case 'postgresql':
            return `"${identifier.replace(/"/g, '""')}"`;
        case 'mysql':
            return `\`${identifier.replace(/`/g, '``')}\``;
        case 'oracle':
            return `"${identifier.toUpperCase().replace(/"/g, '""')}"`;
        default:
            return identifier;
    }
}

export function getBindVariablePlaceholder(index: number, dbms: string) {
  switch (dbms?.toLowerCase()) {
    case 'postgresql':
      return `$${index}`;
    case 'mysql':
      return `?`;
    case 'oracle':
      return `:${index}`;
    default:
      throw new Error(`Unsupported database type: ${dbms}`);
  }
}