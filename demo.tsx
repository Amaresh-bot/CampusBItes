// demo.tsx

import { MenuItemCard } from "@/components/ui/menu-item-card"; // Adjust the import path

const menuItems = [
  {
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
    isVegetarian: true,
    name: "Strawberry Lemonade",
    price: 139,
    originalPrice: 279,
    quantity: "450 ml",
    prepTimeInMinutes: 5,
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80",
    isVegetarian: true,
    name: "Vietnamese Cold Coffee",
    price: 189,
    originalPrice: 529,
    quantity: "450 ml",
    prepTimeInMinutes: 5,
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80",
    isVegetarian: true,
    name: "Chole & Chapati",
    price: 149,
    originalPrice: 419,
    quantity: "Serves 1",
    prepTimeInMinutes: 5,
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&auto=format&fit=crop&q=80",
    isVegetarian: true,
    name: "Bhelpuri",
    price: 119,
    originalPrice: 229,
    quantity: "1 Portion",
    prepTimeInMinutes: 5,
  },
];

export default function MenuItemCardDemo() {
  const handleAddItem = (itemName: string) => {
    console.log(`Added ${itemName} to cart!`);
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen p-4 bg-background">
      <div className="grid w-full max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {menuItems.map((item, index) => (
          <MenuItemCard
            key={index}
            imageUrl={item.imageUrl}
            isVegetarian={item.isVegetarian}
            name={item.name}
            price={item.price}
            originalPrice={item.originalPrice}
            quantity={item.quantity}
            prepTimeInMinutes={item.prepTimeInMinutes}
            onAdd={() => handleAddItem(item.name)}
          />
        ))}
      </div>
    </div>
  );
}
