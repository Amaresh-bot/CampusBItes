import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAvatarEmoji(name: string): string {
  if (!name) return '🧑‍🎓';
  const emojis = [
    '🧑‍🎓', '👨‍🎓', '👩‍🎓', '🍕', '🍔', '🍟', '🌭', '🥪', '🌮', '🌯', 
    '🥗', '🍜', '🍱', '🍣', '🥟', '🍛', '🥞', '🧇', '🍩', '🍪', 
    '🧁', '🍰', '🍧', '🍨', '🍦', '🥧', '🍫', '🍿', '🥤', '🧋', 
    '☕', '🍵', '🍉', '🍓'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % emojis.length;
  return emojis[index];
}
