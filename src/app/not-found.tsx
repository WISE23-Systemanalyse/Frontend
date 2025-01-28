// Erstelle ein einfaches Fallback-Bild für fehlerhafte Movie-Bilder
export default function NotFoundImage() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#1C1C1C]">
      <div className="text-gray-500 text-sm">Kein Bild verfügbar</div>
    </div>
  )
} 