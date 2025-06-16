import Button from "@/components/Button";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { addTableToProject, getAvailableTables } from "./actions";
import { Table } from "@/types/types";
import SidebarMenu from "@/components/SidebarMenu";
import AddDbTable from "./AddDbTable";

type ERDSidebarProps = {
    projectId: number;
    setNodes: Function;
}

const ERDSidebar:React.FC<ERDSidebarProps> = ({ projectId, setNodes }) => {
    const [availableTables, setAvailableTables] = useState<{ id: number; name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function fetchTables() {
            setIsLoading(true);
            try {
                const tables = await getAvailableTables();
                setAvailableTables(tables);
            } catch (error) {
                console.error("テーブルの取得に失敗しました:", error);
            } finally {
                setIsLoading(false)
            }
        }
        fetchTables();
    }, []);
        
    // const handleAddTable = async (tableId: number) => {
    //         const formData = new FormData();
    //         formData.append('projectId', projectId.toString());
    //         formData.append('tableId', tableId.toString());
    //         try {
    //             const result = await addTableToProject({}, formData);
    //             if (result.success) {
    //                 const table = availableTables.find((t) => t.id === tableId);
    //                 if (table) {
    //                     addNewTadleNode(table as Table)
    //                     closeModal();
    //                 }
    //             } else {
    //                 alert(result.errors?._form?.[0] || 'テーブル追加に失敗しました');
    //             }
    //         } catch (error) {
    //             console.error('テーブル追加に失敗しました:', error);
    //             alert('テーブル追加に失敗しました');
    //         }
    //     };

    const addNewTadleNode = (newTable: Table) => {
        router.refresh()
        setNodes((nds:Node[]) => [
            ...nds,
            {
                id: newTable.id.toString(),
                type: 'table',
                position: { x: Math.random() * 500, y: Math.random() * 500 },
                data: { name: newTable.name, columns: newTable.columns },
            },
        ]);
    }

    return (
        <>
            <SidebarMenu
                header={<h2 className="text-lg font-semibold">テーブル管理</h2>}
                ariaLabel="プロジェクトサイドバー"
            >
                <div className="flex flex-col gap-2">
                    <Button
                        onClick={() => router.push("/projects")}
                        color="secondary"
                        className="w-full"
                        disabled={isLoading}
                    >
                        プロジェクト一覧に戻る
                    </Button>
                    <AddDbTable 
                        projectId={projectId}
                        addNewTableNode={addNewTadleNode}
                        isLoading={isLoading}
                    />
                    {isLoading && (
                        <div className="text-center text-gray-500">読み込み中...</div>
                    )}
                </div>
            </SidebarMenu>
            
        </>
    );
}

export default ERDSidebar;