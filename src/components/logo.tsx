import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <span className="text-2xl font-bold bg-gradient-to-r from-green-800 to-green-600 bg-clip-text text-transparent">
        NOWEXO
      </span>
    </Link>
  );
}
