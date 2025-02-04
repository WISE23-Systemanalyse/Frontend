import Link from 'next/link';
import { LayoutGrid, Film, Armchair } from 'lucide-react';

export function Sidebar() {
  return (
    <nav className="space-y-2">
      <Link 
        href="/admin/dashboard" 
        className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-red-500/10 rounded-lg transition-colors"
      >
        <LayoutGrid className="w-5 h-5" />
        <span>Dashboard</span>
      </Link>
      <Link 
        href="/admin/halls" 
        className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-red-500/10 rounded-lg transition-colors"
      >
        <Film className="w-5 h-5" />
        <span>Säle</span>
      </Link>
      <Link 
        href="/admin/categories" 
        className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-red-500/10 rounded-lg transition-colors"
      >
        <Armchair className="w-5 h-5" />
        <span>Sitzplatzkategorien</span>
      </Link>
    </nav>
  );
} 