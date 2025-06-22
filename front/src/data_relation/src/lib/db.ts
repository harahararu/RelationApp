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

export function getConnection(database: DatabaseConfig) {
    const key = `${database.dbms}:${database.host}:${database.port}:${database.databaseName}`;
    if (!pools[key]) {
        switch (database.dbms) {
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
                pools[key] = oracledb.createPool({
                    user: database.username,
                    password: database.password,
                    connectString: `${database.host}:${database.port??1521}/${database.databaseName}`,
                }).catch((err: any) => {
                    console.error('Oracle pool creation error:', err);
                    throw err;
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
    switch (dbms) {
        case 'postgresql':
            return (await connection.query(query, values)).rows;
        case 'mysql':
            const [rows] = await connection.execute(query, values);
            return rows;
        case 'oracle':
            const result = await connection.execute(query, values);
            return result.rows;
        default:
            throw new Error(`Unsupported database type: ${dbms}`);
    }
}

export function sanitizeIdentifier(identifier: string, dbms: string | null) {
    switch (dbms) {
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