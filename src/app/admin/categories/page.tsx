'use client';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";
import { Square, Crown, Armchair } from 'lucide-react';

interface Category {
  id: number;
  category_name: string;
  surcharge: number;
}

interface EditingState {
  id: number | null;
  price: string;
}

const API_BASE_URL = process.env.BACKEND_URL;

// Aktualisierte Helfer-Funktion mit den gleichen Farben wie im SeatEditor
const getCategoryStyle = (categoryName: string) => {
  switch (categoryName.toLowerCase()) {
    case 'standard':
      return {
        icon: <Square size={48} className="text-emerald-500" />,
        textColor: 'text-white',
        bgColor: 'bg-[#2C2C2C]',
        hoverBgColor: 'hover:bg-[#3C3C3C]'
      };
    case 'premium':
      return {
        icon: <Armchair size={56} className="text-blue-500" />,
        textColor: 'text-white',
        bgColor: 'bg-[#2C2C2C]',
        hoverBgColor: 'hover:bg-[#3C3C3C]'
      };
    case 'vip':
      return {
        icon: <Crown size={56} className="text-purple-500" />,
        textColor: 'text-white',
        bgColor: 'bg-[#2C2C2C]',
        hoverBgColor: 'hover:bg-[#3C3C3C]'
      };
    default:
      return {
        icon: <Square size={48} className="text-gray-400" />,
        textColor: 'text-white',
        bgColor: 'bg-[#2C2C2C]',
        hoverBgColor: 'hover:bg-[#3C3C3C]'
      };
  }
};

// Hilfsfunktion für die Sortierreihenfolge
const getCategoryOrder = (categoryName: string): number => {
  switch (categoryName.toLowerCase()) {
    case 'standard':
      return 1;
    case 'premium':
      return 2;
    case 'vip':
      return 3;
    default:
      return 4;
  }
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingState>({ id: null, price: '' });
  const [toast, setToast] = useState<{
    message: string;
    variant: 'success' | 'error' | 'loading' | 'default';
    isVisible: boolean;
  }>({
    message: '',
    variant: 'default',
    isVisible: false
  });

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/categories`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Fehler beim Laden der Kategorien:', err);
      setError('Kategorien konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (category: Category) => {
    setEditing({
      id: category.id,
      price: (category.surcharge).toFixed(2)
    });
  };

  const handlePriceChange = (value: string) => {
    if (!/^\d*\.?\d{0,2}$/.test(value)) return;
    setEditing(prev => ({ ...prev, price: value }));
  };

  const handleSave = async (categoryId: number) => {
    try {
      // Konvertiere den Euro-Betrag in Cent für die API
      const euros = parseFloat(editing.price);
      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: categoryId,
          category_name: categories.find(cat => cat.id === categoryId)?.category_name,
          surcharge: euros
        }),
      });

      if (response.ok) {
        setCategories(prev => prev.map(cat => 
          cat.id === categoryId ? { ...cat, surcharge: euros } : cat
        ));
        setEditing({ id: null, price: '' });
        setToast({
          message: 'Preis erfolgreich aktualisiert',
          variant: 'success',
          isVisible: true
        });
      } else {
        throw new Error('Preis konnte nicht aktualisiert werden');
      }
    } catch {
      setToast({
        message: 'Fehler beim Aktualisieren des Preises',
        variant: 'error',
        isVisible: true
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#141414]">
      <Toast 
        {...toast} 
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
      <div className="max-w-[1200px] mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Kategorieverwaltung</h1>
        </div>

        {isLoading ? (
          <div className="text-white text-center py-8">Lade Kategorien...</div>
        ) : error ? (
          <div className="bg-[#2C2C2C] p-4 rounded text-red-500">
            {error}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-white text-center py-8">
            Keine Kategorien gefunden
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories
              .sort((a, b) => getCategoryOrder(a.category_name) - getCategoryOrder(b.category_name))
              .map(category => {
                const categoryStyle = getCategoryStyle(category.category_name);
                return (
                  <div 
                    key={category.id} 
                    className={`${categoryStyle.bgColor} rounded-lg p-6 ${categoryStyle.hoverBgColor} transition-colors`}
                  >
                    <div className="flex flex-col items-center mb-4">
                      <div className="w-full flex justify-center mb-4">
                        <div className="w-24 h-24 bg-black/20 rounded-lg flex items-center justify-center">
                          {categoryStyle.icon}
                        </div>
                      </div>
                      <h2 className={`text-xl font-bold ${categoryStyle.textColor} mb-2`}>
                        {category.category_name}
                      </h2>
                      {editing.id === category.id ? (
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Input
                              type="number"
                              value={editing.price}
                              onChange={(e) => handlePriceChange(e.target.value)}
                              className="bg-black/20 text-white border-0 pl-7 w-32 focus:ring-1 focus:ring-white/20"
                              step="0.01"
                              min="0"
                            />
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60">
                              €
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-white/80">
                          Aufpreis: {category.surcharge.toFixed(2)}€
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {editing.id === category.id ? (
                        <>
                          <Button 
                            onClick={() => handleSave(category.id)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                          >
                            Speichern
                          </Button>
                          <Button 
                            onClick={() => setEditing({ id: null, price: '' })}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                          >
                            Abbrechen
                          </Button>
                        </>
                      ) : (
                        <Button 
                          onClick={() => handleEdit(category)}
                          className="flex-1 bg-[#3C3C3C] hover:bg-[#4C4C4C] text-white"
                        >
                          Aufpreis ändern
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
} 