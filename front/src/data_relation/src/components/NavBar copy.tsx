'use client';
import Link from 'next/link';

export default function NavBar() {

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="text-lg font-bold">ERDエディタ</div>
        <div className="space-x-4">
          <Link href="/projects" className="hover:underline">
            プロジェクト一覧
          </Link>
          <Link href="/databases" className="hover:underline">
            データベース一覧
          </Link>
          <Link href="/projects/new" className="hover:underline">
            新規プロジェクト
          </Link>
        </div>
      </div>
    </nav>
  );
}