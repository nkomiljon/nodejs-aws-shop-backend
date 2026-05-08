export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  count: number;
}

export const products: Product[] = [
  {
    id: "1",
    title: "BYD ATTO 3 EVO",
    description: "Electric SUV with 510 km Range",
    price: 24,
    count: 10,
  },
  {
    id: "2",
    title: "BYD SEALION 5 DM-i",
    description: "The super Hybrid SUV",
    price: 15,
    count: 5,
  },
  {
    id: "3",
    title: "BYD TANG",
    description: "The 7-seater All-Electric Performance",
    price: 23,
    count: 8,
  },
  {
    id: "4",
    title: "BYD ATTO 2 DM-i",
    description: "Compact Hybrid SUV",
    price: 15,
    count: 3,
  },
  {
    id: "5",
    title: "BYD SEAL 6 DM-i",
    description: "Plug-in Hybrid Car",
    price: 65,
    count: 12,
  },
];
