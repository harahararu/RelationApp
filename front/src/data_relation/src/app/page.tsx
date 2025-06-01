import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Link href="/erd" className="bg-primary text-black px-6 py-3 rounded-md hover:bg-blue-700 transition">
        ERDエディタを開く
      </Link>
    </div>
  );
}