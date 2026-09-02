import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="text-8xl mb-4">🏏</div>
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-gray-400 mb-6">This page is out of bounds!</p>
      <Link href="/" className="bg-ipl-blue hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
        Back to Dashboard
      </Link>
    </div>
  );
}
