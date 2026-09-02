export function ErrorState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-red-400">
      <span className="text-5xl mb-4">⚠️</span>
      <p className="text-lg">{message || 'Something went wrong. Please try again.'}</p>
    </div>
  );
}
