import { Product } from './printTypes';

export const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'notebooks', name: 'Notebooks' },
  { id: 'pens_and_pencils', name: 'Pens & Pencils' },
  { id: 'files_and_folders', name: 'Files & Folders' },
  { id: 'printouts', name: 'Printouts' },
  { id: 'art_and_craft', name: 'Art & Craft' }
];

export const PRODUCTS: Product[] = [
  // Today's Staff Picks
  {
    id: 'staff-1',
    category: 'notebooks',
    title: 'Classmate Pulse',
    subtitle: 'Notebook (200 Pages)',
    price: 60,
    image: '/src/assets/images/product_navy_notebook_1781436252516.jpg',
    isStaffPick: true,
    isSphnPick: true
  },
  {
    id: 'staff-2',
    category: 'pens_and_pencils',
    title: 'Hauser XO',
    subtitle: 'Ball Pen',
    price: 10,
    rating: 4.6,
    image: '/src/assets/images/product_ball_pen_1781436269465.jpg',
    isStaffPick: true
  },
  {
    id: 'staff-4',
    category: 'files_and_folders',
    title: 'Clear Bag',
    subtitle: 'A4 Size',
    price: 30,
    image: '/src/assets/images/product_clear_bag_1781436305926.jpg',
    isStaffPick: true
  },

  // Category: Notebooks
  {
    id: 'nb-1',
    category: 'notebooks',
    title: 'SPHN Practical Lab Book',
    subtitle: 'Rule & Plain Paper, 120 Pages',
    price: 75,
    rating: 4.9,
    image: '/src/assets/images/product_navy_notebook_1781436252516.jpg'
  },
  {
    id: 'nb-3',
    category: 'notebooks',
    title: 'Classmate Spiral A4',
    subtitle: '300 Pages, Softbound Cover',
    price: 140,
    rating: 4.8,
    image: '/src/assets/images/product_navy_notebook_1781436252516.jpg'
  },
  {
    id: 'nb-4',
    category: 'notebooks',
    title: 'Executive Leatherette Journal',
    subtitle: 'Unruled Ivory Sheets, Bookmarker',
    price: 299,
    rating: 4.5,
    image: '/src/assets/images/product_navy_notebook_1781436252516.jpg'
  },

  // Category: Pens & Pencils
  {
    id: 'pen-1',
    category: 'pens_and_pencils',
    title: 'Pilot V5 Liquid Ink Pen',
    subtitle: 'Hyper Fine Tip, Blue Ink',
    price: 80,
    rating: 4.8,
    image: '/src/assets/images/product_ball_pen_1781436269465.jpg'
  },
  {
    id: 'pen-2',
    category: 'pens_and_pencils',
    title: 'Camlin 2B Drawing Pencils',
    subtitle: 'Premium Lead, Pack of 10',
    price: 60,
    rating: 4.4,
    image: '/src/assets/images/product_ball_pen_1781436269465.jpg'
  },
  {
    id: 'pen-3',
    category: 'pens_and_pencils',
    title: 'Pentel Graphgear 500',
    subtitle: 'Drafting Mechanical Pencil 0.5',
    price: 450,
    rating: 4.9,
    image: '/src/assets/images/product_ball_pen_1781436269465.jpg'
  },

  // Category: Files & Folders
  {
    id: 'file-1',
    category: 'files_and_folders',
    title: 'My Choice Ring Binder Folder',
    subtitle: 'Heavy Duty Metal Clip, Black',
    price: 110,
    rating: 4.3,
    image: '/src/assets/images/product_clear_bag_1781436305926.jpg'
  },
  {
    id: 'file-2',
    category: 'files_and_folders',
    title: 'Strip File Transparent',
    subtitle: 'Report Cover, Pack of 5',
    price: 45,
    rating: 4.2,
    image: '/src/assets/images/product_clear_bag_1781436305926.jpg'
  },

  // Category: Printouts
  {
    id: 'print-1',
    category: 'printouts',
    title: 'Xerox',
    subtitle: 'Customizable high quality print',
    price: 5,
    rating: 5.0,
    image: '/src/assets/images/product_clear_bag_1781436305926.jpg'
  },

  // Category: Art & Craft
  {
    id: 'art-1',
    category: 'art_and_craft',
    title: 'Pidilite Fevicol MR',
    subtitle: 'Reliable Squeezable Bottle, 200g',
    price: 55,
    rating: 4.8,
    image: '/src/assets/images/product_sticky_notes_1781436287124.jpg'
  },
  {
    id: 'art-2',
    category: 'art_and_craft',
    title: 'Kores Premium Scissors',
    subtitle: 'Stainless Steel Blades with Comfort Grip',
    price: 85,
    rating: 4.4,
    image: '/src/assets/images/product_sticky_notes_1781436287124.jpg'
  },

];
