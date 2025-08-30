import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatNumber(num: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getRoleDisplayName(role: string): string {
  const roleMap: { [key: string]: string } = {
    'main_admin': 'Main Admin',
    'country_admin': 'Country Admin',
    'state_admin': 'State Admin',
    'city_admin': 'City Admin',
    'producer': 'Producer',
    'buyer': 'Buyer',
    'auditor': 'Auditor',
  };
  return roleMap[role] || role;
}

export function getRoleColor(role: string): string {
  const colorMap: { [key: string]: string } = {
    'main_admin': 'bg-red-100 text-red-800',
    'country_admin': 'bg-orange-100 text-orange-800',
    'state_admin': 'bg-yellow-100 text-yellow-800',
    'city_admin': 'bg-blue-100 text-blue-800',
    'producer': 'bg-green-100 text-green-800',
    'buyer': 'bg-purple-100 text-purple-800',
    'auditor': 'bg-gray-100 text-gray-800',
  };
  return colorMap[role] || 'bg-gray-100 text-gray-800';
}