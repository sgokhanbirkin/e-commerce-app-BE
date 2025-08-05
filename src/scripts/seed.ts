import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.basketItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // Create categories
  const electronics = await prisma.category.create({
    data: {
      name: "Electronics",
    },
  });

  const clothing = await prisma.category.create({
    data: {
      name: "Clothing",
    },
  });

  const home = await prisma.category.create({
    data: {
      name: "Home & Garden",
    },
  });

  const sports = await prisma.category.create({
    data: {
      name: "Sports & Outdoors",
    },
  });

  const books = await prisma.category.create({
    data: {
      name: "Books & Media",
    },
  });

  // Create products with variants
  const products = [
    {
      title: "iPhone 15 Pro",
      description: "Latest iPhone with advanced camera system",
      price: 999.99,
      imageUrl:
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
      categoryId: electronics.id,
      variants: [
        {
          sku: "IPHONE15PRO-128",
          attribute: "capacity",
          value: "128GB",
          stock: 20,
          priceDiff: 0,
        },
        {
          sku: "IPHONE15PRO-256",
          attribute: "capacity",
          value: "256GB",
          stock: 20,
          priceDiff: 100,
        },
        {
          sku: "IPHONE15PRO-512",
          attribute: "capacity",
          value: "512GB",
          stock: 10,
          priceDiff: 300,
        },
      ],
    },
    {
      title: "MacBook Air M3",
      description: "Ultra-thin laptop with M3 chip",
      price: 1199.99,
      imageUrl:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
      categoryId: electronics.id,
      variants: [
        {
          sku: "MACBOOKAIR-8GB",
          attribute: "ram",
          value: "8GB RAM",
          stock: 15,
          priceDiff: 0,
        },
        {
          sku: "MACBOOKAIR-16GB",
          attribute: "ram",
          value: "16GB RAM",
          stock: 15,
          priceDiff: 200,
        },
      ],
    },
    {
      title: "Nike Air Max 270",
      description: "Comfortable running shoes with Air Max technology",
      price: 129.99,
      imageUrl:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
      categoryId: clothing.id,
      variants: [
        {
          sku: "NIKEAIRMAX-7",
          attribute: "size",
          value: "US 7",
          stock: 25,
          priceDiff: 0,
        },
        {
          sku: "NIKEAIRMAX-8",
          attribute: "size",
          value: "US 8",
          stock: 25,
          priceDiff: 0,
        },
        {
          sku: "NIKEAIRMAX-9",
          attribute: "size",
          value: "US 9",
          stock: 25,
          priceDiff: 0,
        },
        {
          sku: "NIKEAIRMAX-10",
          attribute: "size",
          value: "US 10",
          stock: 25,
          priceDiff: 0,
        },
      ],
    },
    {
      title: "Levi's 501 Jeans",
      description: "Classic straight-fit denim jeans",
      price: 79.99,
      imageUrl:
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
      categoryId: clothing.id,
      variants: [
        {
          sku: "LEVIS501-30X32",
          attribute: "size",
          value: "30x32",
          stock: 20,
          priceDiff: 0,
        },
        {
          sku: "LEVIS501-32X32",
          attribute: "size",
          value: "32x32",
          stock: 20,
          priceDiff: 0,
        },
        {
          sku: "LEVIS501-34X32",
          attribute: "size",
          value: "34x32",
          stock: 20,
          priceDiff: 0,
        },
        {
          sku: "LEVIS501-36X32",
          attribute: "size",
          value: "36x32",
          stock: 15,
          priceDiff: 0,
        },
      ],
    },
    {
      title: "IKEA MALM Bed Frame",
      description: "Modern queen-size bed frame",
      price: 199.99,
      imageUrl:
        "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400",
      categoryId: home.id,
      variants: [
        {
          sku: "MALMBED-QUEEN",
          attribute: "size",
          value: "Queen",
          stock: 15,
          priceDiff: 0,
        },
        {
          sku: "MALMBED-KING",
          attribute: "size",
          value: "King",
          stock: 10,
          priceDiff: 100,
        },
      ],
    },
    {
      title: "Philips Hue Smart Bulb",
      description: "WiFi-enabled smart LED bulb",
      price: 49.99,
      imageUrl:
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400",
      categoryId: home.id,
      variants: [
        {
          sku: "PHILIPSHUE-WHITE",
          attribute: "type",
          value: "White",
          stock: 100,
          priceDiff: 0,
        },
        {
          sku: "PHILIPSHUE-COLOR",
          attribute: "type",
          value: "Color",
          stock: 100,
          priceDiff: 20,
        },
      ],
    },
    {
      title: "Nike Basketball",
      description: "Official size and weight basketball",
      price: 29.99,
      imageUrl:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
      categoryId: sports.id,
      variants: [
        {
          sku: "NIKEBASKETBALL-6",
          attribute: "size",
          value: "Size 6",
          stock: 40,
          priceDiff: 0,
        },
        {
          sku: "NIKEBASKETBALL-7",
          attribute: "size",
          value: "Size 7",
          stock: 40,
          priceDiff: 5,
        },
      ],
    },
    {
      title: "Yoga Mat Premium",
      description: "Non-slip yoga mat with carrying strap",
      price: 34.99,
      imageUrl:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
      categoryId: sports.id,
      variants: [
        {
          sku: "YOGAMAT-6MM",
          attribute: "thickness",
          value: "6mm",
          stock: 60,
          priceDiff: 0,
        },
        {
          sku: "YOGAMAT-8MM",
          attribute: "thickness",
          value: "8mm",
          stock: 60,
          priceDiff: 10,
        },
      ],
    },
    {
      title: "The Great Gatsby",
      description: "F. Scott Fitzgerald's classic novel",
      price: 12.99,
      imageUrl:
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
      categoryId: books.id,
      variants: [
        {
          sku: "GREATGATSBY-PAPERBACK",
          attribute: "format",
          value: "Paperback",
          stock: 75,
          priceDiff: 0,
        },
        {
          sku: "GREATGATSBY-HARDCOVER",
          attribute: "format",
          value: "Hardcover",
          stock: 50,
          priceDiff: 5,
        },
        {
          sku: "GREATGATSBY-EBOOK",
          attribute: "format",
          value: "E-book",
          stock: 25,
          priceDiff: -5,
        },
      ],
    },
    {
      title: "Kindle Paperwhite",
      description: "Waterproof e-reader with 8GB storage",
      price: 139.99,
      imageUrl:
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
      categoryId: books.id,
      variants: [
        {
          sku: "KINDLE-8GB",
          attribute: "storage",
          value: "8GB",
          stock: 35,
          priceDiff: 0,
        },
        {
          sku: "KINDLE-32GB",
          attribute: "storage",
          value: "32GB",
          stock: 30,
          priceDiff: 20,
        },
      ],
    },
  ];

  for (const product of products) {
    const { variants, ...productData } = product;

    const createdProduct = await prisma.product.create({
      data: productData,
    });

    // Create variants for this product
    for (const variant of variants) {
      await prisma.productVariant.create({
        data: {
          ...variant,
          productId: createdProduct.id,
        },
      });
    }
  }

  console.log("✅ Database seeded successfully!");
  console.log(
    `📊 Created ${products.length} products with variants across 5 categories`
  );
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
