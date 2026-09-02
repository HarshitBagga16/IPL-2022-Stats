import { cn } from '@/lib/utils';

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex justify-center items-center py-16', className)}>
      <div className="w-10 h-10 border-4 border-ipl-blue border-t-ipl-gold rounded-full animate-spin" />
    </div>
  );
}
