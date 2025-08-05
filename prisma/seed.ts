import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // İlk olarak tüm eski verileri temizleyin
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.basketItem.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // Kategorileri oluştur
  const categories = [
    { name: "Men's Clothing" },
    { name: "Women's Clothing" },
    { name: "Shoes" },
    { name: "Electronics" },
    { name: "Accessories" },
  ];

  const createdCategories = [];
  for (const cat of categories) {
    const category = await prisma.category.create({
      data: cat,
    });
    createdCategories.push(category);
  }

  // Kategori ID'lerini al
  const mensClothingId = createdCategories[0].id;
  const womensClothingId = createdCategories[1].id;
  const shoesId = createdCategories[2].id;
  const electronicsId = createdCategories[3].id;
  const accessoriesId = createdCategories[4].id;

  // 20 ürünlük seed
  const productsData = [
    {
      title: "Fjallraven Backpack",
      price: 109.95,
      description: "Your perfect pack for everyday use and walks in the forest.",
      categoryId: mensClothingId,
      imageUrl: "/images/backpack.jpg",
      variants: [
        { sku: "BACK-001-BLACK-S", attribute: "color", value: "Black", stock: 10, priceDiff: 0 },
        { sku: "BACK-001-BLACK-M", attribute: "color", value: "Black", stock: 12, priceDiff: 0 },
      ],
    },
    {
      title: "Men's Casual Premium Slim Fit T-Shirt",
      price: 22.3,
      description: "Slim-fitting style, contrast raglan long sleeve.",
      categoryId: mensClothingId,
      imageUrl: "/images/tshirt_men.jpg",
      variants: [
        { sku: "TSHIRT-001-WHITE-M", attribute: "color", value: "White", stock: 20, priceDiff: 0 },
        { sku: "TSHIRT-001-BLACK-L", attribute: "color", value: "Black", stock: 15, priceDiff: 0 },
      ],
    },
    {
      title: "Mens Cotton Jacket",
      price: 55.99,
      description: "Great outerwear jackets for Spring/Autumn/Winter.",
      categoryId: mensClothingId,
      imageUrl: "/images/jacket_men.jpg",
      variants: [
        { sku: "JACKET-001-KHAKI-M", attribute: "color", value: "Khaki", stock: 8, priceDiff: 0 },
        { sku: "JACKET-001-NAVY-L", attribute: "color", value: "Navy", stock: 5, priceDiff: 0 },
      ],
    },
    {
      title: "Women's Lightweight Jacket",
      price: 39.99,
      description: "Lightweight windbreaker for your daily outfit.",
      categoryId: womensClothingId,
      imageUrl: "/images/jacket_women.jpg",
      variants: [
        { sku: "JACKET-002-PINK-S", attribute: "color", value: "Pink", stock: 14, priceDiff: 0 },
        { sku: "JACKET-002-GREY-M", attribute: "color", value: "Grey", stock: 10, priceDiff: 0 },
      ],
    },
    {
      title: "Women's Cotton Shorts",
      price: 25.0,
      description: "Comfortable cotton shorts for summer days.",
      categoryId: womensClothingId,
      imageUrl: "/images/shorts_women.jpg",
      variants: [
        { sku: "SHORTS-001-BLUE-S", attribute: "color", value: "Blue", stock: 20, priceDiff: 0 },
        { sku: "SHORTS-001-WHITE-M", attribute: "color", value: "White", stock: 18, priceDiff: 0 },
      ],
    },
    {
      title: "Fjallraven Foldsack No. 1 Backpack",
      price: 129.95,
      description: "Fits 15″ laptops and more.",
      categoryId: mensClothingId,
      imageUrl: "/images/foldsack_backpack.jpg",
      variants: [
        { sku: "BACK-002-GREEN-OS", attribute: "color", value: "Green", stock: 25, priceDiff: 0 },
      ],
    },
    {
      title: "Puma RS-X Sneakers",
      price: 89.99,
      description: "PUMA RS-X toys up 80s running-inspired vibe.",
      categoryId: shoesId,
      imageUrl: "/images/puma_sneakers.jpg",
      variants: [
        { sku: "SNEAKERS-001-WHITE-9", attribute: "color", value: "White", stock: 30, priceDiff: 0 },
        { sku: "SNEAKERS-001-BLACK-10", attribute: "color", value: "Black", stock: 22, priceDiff: 0 },
      ],
    },
    {
      title: "Adidas Ultraboost Shoes",
      price: 179.99,
      description: "Comfort and performance for running.",
      categoryId: shoesId,
      imageUrl: "/images/adidas_ultraboost.jpg",
      variants: [
        { sku: "SNEAKERS-002-BLACK-8", attribute: "color", value: "Core Black", stock: 12, priceDiff: 0 },
        { sku: "SNEAKERS-002-NAVY-9", attribute: "color", value: "Collegiate Navy", stock: 15, priceDiff: 0 },
      ],
    },
    {
      title: "Converse Chuck Taylor",
      price: 59.99,
      description: "Classic unisex canvas high top sneakers.",
      categoryId: shoesId,
      imageUrl: "/images/converse_chuck.jpg",
      variants: [
        { sku: "SNEAKERS-003-BLACK-7", attribute: "color", value: "Black", stock: 18, priceDiff: 0 },
        { sku: "SNEAKERS-003-WHITE-8", attribute: "color", value: "White", stock: 20, priceDiff: 0 },
      ],
    },
    {
      title: "iPhone 14 Pro Max",
      price: 1099.0,
      description: "Apple smartphone with A16 Bionic chip.",
      categoryId: electronicsId,
      imageUrl: "/images/iphone14promax.jpg",
      variants: [
        { sku: "PHONE-001-BLACK-128", attribute: "color", value: "Space Black", stock: 5, priceDiff: 0 },
        { sku: "PHONE-001-SILVER-256", attribute: "color", value: "Silver", stock: 3, priceDiff: 100 },
      ],
    },
    {
      title: "Samsung Galaxy S23 Ultra",
      price: 1199.0,
      description: "Samsung flagship with 200MP camera.",
      categoryId: electronicsId,
      imageUrl: "/images/galaxy_s23_ultra.jpg",
      variants: [
        { sku: "PHONE-002-BLACK-256", attribute: "color", value: "Phantom Black", stock: 4, priceDiff: 0 },
        { sku: "PHONE-002-GREEN-512", attribute: "color", value: "Green", stock: 2, priceDiff: 200 },
      ],
    },
    {
      title: "Google Pixel 7",
      price: 599.0,
      description: "AI-powered camera and Android 13.",
      categoryId: electronicsId,
      imageUrl: "/images/pixel7.jpg",
      variants: [
        { sku: "PHONE-003-SNOW-128", attribute: "color", value: "Snow", stock: 10, priceDiff: 0 },
        { sku: "PHONE-003-OBSIDIAN-256", attribute: "color", value: "Obsidian", stock: 8, priceDiff: 100 },
      ],
    },
    {
      title: "Sony WH-1000XM5 Headphones",
      price: 349.99,
      description: "Industry-leading noise canceling.",
      categoryId: electronicsId,
      imageUrl: "/images/sony_wh1000xm5.jpg",
      variants: [
        { sku: "HEADPHONES-001-BLACK-OS", attribute: "color", value: "Black", stock: 15, priceDiff: 0 },
      ],
    },
    {
      title: "Dell XPS 13 Laptop",
      price: 999.99,
      description: "Ultra-portable laptop with 13.4″ display.",
      categoryId: electronicsId,
      imageUrl: "/images/dell_xps13.jpg",
      variants: [
        { sku: "LAPTOP-001-SILVER-256", attribute: "color", value: "Platinum Silver", stock: 6, priceDiff: 0 },
        { sku: "LAPTOP-001-BLACK-512", attribute: "color", value: "Black", stock: 4, priceDiff: 200 },
      ],
    },
    {
      title: "Nike Air Force 1",
      price: 90.0,
      description: "The legend lives on in the AF-1 '07.",
      categoryId: shoesId,
      imageUrl: "/images/nike_airforce1.jpg",
      variants: [
        { sku: "SNEAKERS-004-WHITE-9", attribute: "color", value: "White", stock: 20, priceDiff: 0 },
        { sku: "SNEAKERS-004-BLACK-10", attribute: "color", value: "Black", stock: 18, priceDiff: 0 },
      ],
    },
    {
      title: "Levi's 501 Original Jeans",
      price: 59.99,
      description: "Iconic straight leg jeans.",
      categoryId: mensClothingId,
      imageUrl: "/images/levis_501.jpg",
      variants: [
        { sku: "JEANS-001-BLUE-32", attribute: "color", value: "Blue", stock: 25, priceDiff: 0 },
        { sku: "JEANS-001-BLACK-34", attribute: "color", value: "Black", stock: 20, priceDiff: 0 },
      ],
    },
    {
      title: "Ray-Ban Wayfarer Sunglasses",
      price: 150.0,
      description: "Classic acetate sunglasses.",
      categoryId: accessoriesId,
      imageUrl: "/images/rayban_wayfarer.jpg",
      variants: [
        { sku: "SUNGLASSES-001-TORTOISE-OS", attribute: "color", value: "Tortoise", stock: 12, priceDiff: 0 },
      ],
    },
    {
      title: "The North Face Puffer Jacket",
      price: 199.99,
      description: "Warm puffer jacket for cold weather.",
      categoryId: womensClothingId,
      imageUrl: "/images/tnf_puffer.jpg",
      variants: [
        { sku: "JACKET-003-RED-M", attribute: "color", value: "Red", stock: 8, priceDiff: 0 },
        { sku: "JACKET-003-BLACK-L", attribute: "color", value: "Black", stock: 5, priceDiff: 0 },
      ],
    },
    {
      title: "Apple MacBook Air M2",
      price: 1199.0,
      description: "Apple M2 chip with 8-core CPU.",
      categoryId: electronicsId,
      imageUrl: "/images/macbook_air_m2.jpg",
      variants: [
        { sku: "LAPTOP-002-MIDNIGHT-256", attribute: "color", value: "Midnight", stock: 3, priceDiff: 0 },
        { sku: "LAPTOP-002-STARLIGHT-512", attribute: "color", value: "Starlight", stock: 2, priceDiff: 200 },
      ],
    },
  ];

  for (const p of productsData) {
    await prisma.product.create({
      data: {
        title: p.title,
        description: p.description,
        price: p.price,
        categoryId: p.categoryId,
        imageUrl: p.imageUrl,
        variants: {
          create: p.variants.map((v) => ({
            sku: v.sku,
            attribute: v.attribute,
            value: v.value,
            stock: v.stock,
            priceDiff: v.priceDiff,
          })),
        },
      },
    });
  }

  console.log("🎉 Seed data created!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  }); 