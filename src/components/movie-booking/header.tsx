import Link from "next/link"

export default function Header() {
  return (
    <header className="bg-black p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-red-600 text-2xl font-bold">
          CinemaPlus
        </Link>
        <nav className="space-x-6">
          <Link href="/films" className="text-white hover:text-red-600">
            Filme
          </Link>
          <Link href="/program" className="text-white hover:text-red-600">
            Programm
          </Link>
          <Link href="/contact" className="text-white hover:text-red-600">
            Kontakt
          </Link>
        </nav>
      </div>
    </header>
  )
}

