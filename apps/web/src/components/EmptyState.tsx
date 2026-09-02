export function EmptyState({ message = 'No data available' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
      <span className="text-5xl mb-4">🏏</span>
      <p className="text-lg">{message}</p>
    </div>
  );
}
