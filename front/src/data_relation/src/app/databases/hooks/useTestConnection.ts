'use client';

import { Dispatch, SetStateAction, useState } from 'react';
import { testDatabaseConnection } from '@/lib/dbacess';
import { Database } from "@/types/types"

interface TestConnectionState {
  success: boolean;
  message: string;
}

type useTestConnectionRetern = [
    result: TestConnectionState,
    setFormData: Dispatch<SetStateAction<Database>>,
    handleTestConnection: () => Promise<void>,
    isLoading: boolean
]

export const useTestConnection = (initialData?: Database): useTestConnectionRetern => {
    const [ result, setResult ] = useState<TestConnectionState>({ success: false, message: '' });
    const [ isLoading, setIsLoading ] = useState<boolean>(false);

    const [formData, setFormData] = useState<Database>({
        name: initialData?.name ?? '',
        dbms: initialData?.dbms ?? '',
        host: initialData?.host ?? '',
        port: initialData?.port?? null,
        databaseName: initialData?.databaseName ?? '',
        username: initialData?.username ?? '',
        password: initialData?.password ?? '',
    });

    const handleTestConnection = async () => {
        setResult({ success: false, message: '' });
        setIsLoading(true);
        const result = await testDatabaseConnection(formData);
        setResult(result);
        setIsLoading(false);
        
    };

    return [result, setFormData, handleTestConnection, isLoading ]
}