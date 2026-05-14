export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  count: number;
}

export const products: Product[] = [
  {
    id: "a3f1c2d4-1111-4b5e-8a9f-000000000001",
    title: "BYD ATTO 3 EVO",
    description: "Electric SUV with 510 km Range",
    price: 24,
    count: 10,
  },
  {
    id: "a3f1c2d4-1111-4b5e-8a9f-000000000002",
    title: "BYD SEALION 5 DM-i",
    description: "The super Hybrid SUV",
    price: 15,
    count: 5,
  },
  {
    id: "a3f1c2d4-1111-4b5e-8a9f-000000000003",
    title: "BYD TANG",
    description: "The 7-seater All-Electric Performance",
    price: 23,
    count: 8,
  },
  {
    id: "a3f1c2d4-1111-4b5e-8a9f-000000000004",
    title: "BYD ATTO 2 DM-i",
    description: "Compact Hybrid SUV",
    price: 15,
    count: 3,
  },
  {
    id: "a3f1c2d4-1111-4b5e-8a9f-000000000005",
    title: "BYD SEAL 6 DM-i",
    description: "Plug-in Hybrid Car",
    price: 65,
    count: 12,
  },
];
