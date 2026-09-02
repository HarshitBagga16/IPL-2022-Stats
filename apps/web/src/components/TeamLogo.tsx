import Image from 'next/image';

export function TeamLogo({ team, size = 40 }: { team: any; size?: number }) {
  if (team?.logoUrl) {
    return <Image src={team.logoUrl} alt={team.name || ''} width={size} height={size} className="object-contain" unoptimized />;
  }
  return <span className="text-2xl">🏏</span>;
}
