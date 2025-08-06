import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

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

  // Create users
  const users = [
    {
      email: "gokhan@birkinapps.com",
      passwordHash: await bcrypt.hash("123456", 10),
      name: "Gokhan Birkin",
      phone: "+905551234567",
      avatarUrl:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    {
      email: "john@example.com",
      passwordHash: await bcrypt.hash("password123", 10),
      name: "John Doe",
      phone: "+1234567890",
    },
    {
      email: "jane@example.com",
      passwordHash: await bcrypt.hash("password123", 10),
      name: "Jane Smith",
      phone: "+1234567891",
    },
    {
      email: "mike@example.com",
      passwordHash: await bcrypt.hash("password123", 10),
      name: "Mike Johnson",
      phone: "+1234567892",
    },
    {
      email: "sarah@example.com",
      passwordHash: await bcrypt.hash("password123", 10),
      name: "Sarah Wilson",
      phone: "+1234567893",
    },
  ];

  const createdUsers = [];
  for (const userData of users) {
    const user = await prisma.user.create({
      data: userData,
    });
    createdUsers.push(user);
  }

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
    {
      title: "Samsung Galaxy S23 Ultra",
      description: "200MP camera with S Pen support",
      price: 1199.99,
      imageUrl:
        "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400",
      categoryId: electronics.id,
      variants: [
        {
          sku: "GALAXYS23-128GB",
          attribute: "storage",
          value: "128GB",
          stock: 15,
          priceDiff: 0,
        },
        {
          sku: "GALAXYS23-256GB",
          attribute: "storage",
          value: "256GB",
          stock: 15,
          priceDiff: 100,
        },
        {
          sku: "GALAXYS23-512GB",
          attribute: "storage",
          value: "512GB",
          stock: 10,
          priceDiff: 200,
        },
      ],
    },
    {
      title: "Google Pixel 7",
      description: "AI-powered camera with Android 13",
      price: 599.99,
      imageUrl:
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
      categoryId: electronics.id,
      variants: [
        {
          sku: "PIXEL7-128GB",
          attribute: "storage",
          value: "128GB",
          stock: 20,
          priceDiff: 0,
        },
        {
          sku: "PIXEL7-256GB",
          attribute: "storage",
          value: "256GB",
          stock: 15,
          priceDiff: 100,
        },
      ],
    },
    {
      title: "Sony WH-1000XM5",
      description: "Industry-leading noise canceling headphones",
      price: 399.99,
      imageUrl:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
      categoryId: electronics.id,
      variants: [
        {
          sku: "SONYWH1000XM5-BLACK",
          attribute: "color",
          value: "Black",
          stock: 25,
          priceDiff: 0,
        },
        {
          sku: "SONYWH1000XM5-SILVER",
          attribute: "color",
          value: "Silver",
          stock: 20,
          priceDiff: 0,
        },
      ],
    },
    {
      title: "Dell XPS 13",
      description: "Ultra-portable laptop with 13.4-inch display",
      price: 999.99,
      imageUrl:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
      categoryId: electronics.id,
      variants: [
        {
          sku: "DELLXPS13-8GB",
          attribute: "ram",
          value: "8GB RAM",
          stock: 10,
          priceDiff: 0,
        },
        {
          sku: "DELLXPS13-16GB",
          attribute: "ram",
          value: "16GB RAM",
          stock: 8,
          priceDiff: 200,
        },
      ],
    },
    {
      title: "Nike Air Force 1",
      description: "Legendary design with classic style",
      price: 89.99,
      imageUrl:
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400",
      categoryId: clothing.id,
      variants: [
        {
          sku: "NIKEAF1-7",
          attribute: "size",
          value: "US 7",
          stock: 30,
          priceDiff: 0,
        },
        {
          sku: "NIKEAF1-8",
          attribute: "size",
          value: "US 8",
          stock: 30,
          priceDiff: 0,
        },
        {
          sku: "NIKEAF1-9",
          attribute: "size",
          value: "US 9",
          stock: 30,
          priceDiff: 0,
        },
        {
          sku: "NIKEAF1-10",
          attribute: "size",
          value: "US 10",
          stock: 25,
          priceDiff: 0,
        },
      ],
    },
    {
      title: "Ray-Ban Wayfarer",
      description: "Classic acetate sunglasses",
      price: 150.0,
      imageUrl:
        "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
      categoryId: clothing.id,
      variants: [
        {
          sku: "RAYBAN-WAYFARER-TORTOISE",
          attribute: "color",
          value: "Tortoise",
          stock: 15,
          priceDiff: 0,
        },
        {
          sku: "RAYBAN-WAYFARER-BLACK",
          attribute: "color",
          value: "Black",
          stock: 15,
          priceDiff: 0,
        },
      ],
    },
    {
      title: "The North Face Puffer Jacket",
      description: "Warm puffer jacket for cold weather",
      price: 199.99,
      imageUrl:
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
      categoryId: clothing.id,
      variants: [
        {
          sku: "TNF-PUFFER-RED-M",
          attribute: "color",
          value: "Red",
          stock: 8,
          priceDiff: 0,
        },
        {
          sku: "TNF-PUFFER-BLACK-L",
          attribute: "color",
          value: "Black",
          stock: 5,
          priceDiff: 0,
        },
      ],
    },
    {
      title: "Apple MacBook Air M2",
      description: "Apple M2 chip with 8-core CPU",
      price: 1199.0,
      imageUrl:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
      categoryId: electronics.id,
      variants: [
        {
          sku: "MACBOOKAIR-M2-8GB",
          attribute: "ram",
          value: "8GB RAM",
          stock: 12,
          priceDiff: 0,
        },
        {
          sku: "MACBOOKAIR-M2-16GB",
          attribute: "ram",
          value: "16GB RAM",
          stock: 10,
          priceDiff: 200,
        },
      ],
    },
    {
      title: "Adidas Ultraboost",
      description: "Premium running shoes with Boost technology",
      price: 179.99,
      imageUrl:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
      categoryId: clothing.id,
      variants: [
        {
          sku: "ADIDAS-ULTRABOOST-7",
          attribute: "size",
          value: "US 7",
          stock: 20,
          priceDiff: 0,
        },
        {
          sku: "ADIDAS-ULTRABOOST-8",
          attribute: "size",
          value: "US 8",
          stock: 20,
          priceDiff: 0,
        },
        {
          sku: "ADIDAS-ULTRABOOST-9",
          attribute: "size",
          value: "US 9",
          stock: 20,
          priceDiff: 0,
        },
        {
          sku: "ADIDAS-ULTRABOOST-10",
          attribute: "size",
          value: "US 10",
          stock: 15,
          priceDiff: 0,
        },
      ],
    },
    {
      title: "Converse Chuck Taylor",
      description: "Classic canvas sneakers",
      price: 59.99,
      imageUrl:
        "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=400",
      categoryId: clothing.id,
      variants: [
        {
          sku: "CONVERSE-CHUCK-7",
          attribute: "size",
          value: "US 7",
          stock: 40,
          priceDiff: 0,
        },
        {
          sku: "CONVERSE-CHUCK-8",
          attribute: "size",
          value: "US 8",
          stock: 40,
          priceDiff: 0,
        },
        {
          sku: "CONVERSE-CHUCK-9",
          attribute: "size",
          value: "US 9",
          stock: 40,
          priceDiff: 0,
        },
        {
          sku: "CONVERSE-CHUCK-10",
          attribute: "size",
          value: "US 10",
          stock: 35,
          priceDiff: 0,
        },
      ],
    },
    {
      title: "iPhone 14 Pro Max",
      description: "A16 Bionic chip with advanced camera system",
      price: 1099.99,
      imageUrl:
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
      categoryId: electronics.id,
      variants: [
        {
          sku: "IPHONE14PROMAX-128GB",
          attribute: "storage",
          value: "128GB",
          stock: 15,
          priceDiff: 0,
        },
        {
          sku: "IPHONE14PROMAX-256GB",
          attribute: "storage",
          value: "256GB",
          stock: 15,
          priceDiff: 100,
        },
        {
          sku: "IPHONE14PROMAX-512GB",
          attribute: "storage",
          value: "512GB",
          stock: 10,
          priceDiff: 200,
        },
      ],
    },
  ];

  const createdProducts = [];
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

    createdProducts.push(createdProduct);
  }

  // Create reviews for products
  const reviews = [
    // iPhone 15 Pro reviews
    {
      productId: createdProducts[0].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 5,
      comment: "A16 Bionic çip harika! Kamera sistemi mükemmel.",
    },
    {
      productId: createdProducts[0].id,
      userId: createdUsers[1].id,
      rating: 4,
      comment: "Great camera system. Fast performance.",
    },
    {
      productId: createdProducts[0].id,
      userId: createdUsers[2].id,
      rating: 5,
      comment: "Best iPhone ever! Love the camera.",
    },

    // MacBook Air M3 reviews
    {
      productId: createdProducts[1].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 5,
      comment: "M3 çip harika! 8-core CPU çok hızlı.",
    },
    {
      productId: createdProducts[1].id,
      userId: createdUsers[3].id,
      rating: 4,
      comment: "Great performance! Battery life is amazing.",
    },

    // Nike Air Max 270 reviews
    {
      productId: createdProducts[2].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 4,
      comment: "Air Max teknolojisi harika! Çok rahat.",
    },
    {
      productId: createdProducts[2].id,
      userId: createdUsers[1].id,
      rating: 5,
      comment: "Love the Air Max technology! Very comfortable.",
    },

    // Levi's 501 Jeans reviews
    {
      productId: createdProducts[3].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 4,
      comment: "Klasik straight-fit! Denim kalitesi harika.",
    },
    {
      productId: createdProducts[3].id,
      userId: createdUsers[4].id,
      rating: 4,
      comment: "Classic fit! Great denim quality.",
    },

    // IKEA MALM Bed Frame reviews
    {
      productId: createdProducts[4].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 4,
      comment: "Modern tasarım! Queen boyut mükemmel.",
    },
    {
      productId: createdProducts[4].id,
      userId: createdUsers[2].id,
      rating: 5,
      comment: "Modern design! Perfect for our bedroom.",
    },

    // Philips Hue Smart Bulb reviews
    {
      productId: createdProducts[5].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 5,
      comment: "WiFi destekli akıllı LED ampul! Renk kontrolü harika.",
    },
    {
      productId: createdProducts[5].id,
      userId: createdUsers[3].id,
      rating: 4,
      comment: "Great smart bulb! Color control is amazing.",
    },

    // Nike Basketball reviews
    {
      productId: createdProducts[6].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 4,
      comment: "Resmi boyut ve ağırlık! Basketbol için mükemmel.",
    },
    {
      productId: createdProducts[6].id,
      userId: createdUsers[1].id,
      rating: 5,
      comment: "Official size and weight! Perfect for basketball.",
    },

    // Yoga Mat Premium reviews
    {
      productId: createdProducts[7].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 5,
      comment: "Kaymaz yoga matı! Taşıma kemeri çok kullanışlı.",
    },
    {
      productId: createdProducts[7].id,
      userId: createdUsers[4].id,
      rating: 4,
      comment: "Non-slip yoga mat! Carrying strap is very useful.",
    },

    // The Great Gatsby reviews
    {
      productId: createdProducts[8].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 5,
      comment: "F. Scott Fitzgerald'ın klasik romanı! Harika hikaye.",
    },
    {
      productId: createdProducts[8].id,
      userId: createdUsers[2].id,
      rating: 4,
      comment: "F. Scott Fitzgerald's classic novel! Great story.",
    },

    // Kindle Paperwhite reviews
    {
      productId: createdProducts[9].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 4,
      comment: "Su geçirmez e-reader! 8GB depolama yeterli.",
    },
    {
      productId: createdProducts[9].id,
      userId: createdUsers[3].id,
      rating: 4,
      comment: "Waterproof e-reader! 8GB storage is enough.",
    },

    // Samsung Galaxy S23 Ultra reviews
    {
      productId: createdProducts[10].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 5,
      comment: "200MP kamera harika! S Pen çok kullanışlı.",
    },
    {
      productId: createdProducts[10].id,
      userId: createdUsers[1].id,
      rating: 4,
      comment: "Amazing camera! S Pen is very useful.",
    },

    // Google Pixel 7 reviews
    {
      productId: createdProducts[11].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 4,
      comment: "AI destekli kamera harika! Android 13 çok akıcı.",
    },
    {
      productId: createdProducts[11].id,
      userId: createdUsers[2].id,
      rating: 5,
      comment: "Great AI camera features! Smooth Android 13.",
    },

    // Sony WH-1000XM5 reviews
    {
      productId: createdProducts[12].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 5,
      comment: "Sektörün en iyi noise canceling! Ses kalitesi mükemmel.",
    },
    {
      productId: createdProducts[12].id,
      userId: createdUsers[3].id,
      rating: 4,
      comment: "Best noise canceling! Amazing sound quality.",
    },

    // Dell XPS 13 reviews
    {
      productId: createdProducts[13].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 4,
      comment: "Ultra-portable laptop! 13.4 inç ekran harika.",
    },
    {
      productId: createdProducts[13].id,
      userId: createdUsers[4].id,
      rating: 5,
      comment: "Perfect for work! Great battery life.",
    },

    // Nike Air Force 1 reviews
    {
      productId: createdProducts[14].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 4,
      comment: "Efsane AF-1! Her zaman şık.",
    },
    {
      productId: createdProducts[14].id,
      userId: createdUsers[1].id,
      rating: 5,
      comment: "Legendary design! Always stylish.",
    },

    // Ray-Ban Wayfarer reviews
    {
      productId: createdProducts[15].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 5,
      comment: "Klasik acetate güneş gözlüğü! Her zaman şık.",
    },
    {
      productId: createdProducts[15].id,
      userId: createdUsers[2].id,
      rating: 4,
      comment: "Classic design! Perfect for any occasion.",
    },

    // The North Face Puffer Jacket reviews
    {
      productId: createdProducts[16].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 5,
      comment: "Soğuk hava için mükemmel! Çok sıcak.",
    },
    {
      productId: createdProducts[16].id,
      userId: createdUsers[3].id,
      rating: 4,
      comment: "Perfect for cold weather! Very warm.",
    },

    // Apple MacBook Air M2 reviews
    {
      productId: createdProducts[17].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 5,
      comment: "M2 çip harika! 8-core CPU çok hızlı.",
    },
    {
      productId: createdProducts[17].id,
      userId: createdUsers[4].id,
      rating: 4,
      comment: "M2 chip is amazing! 8-core CPU is very fast.",
    },

    // Adidas Ultraboost reviews
    {
      productId: createdProducts[18].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 4,
      comment: "Boost teknolojisi harika! Koşu için mükemmel.",
    },
    {
      productId: createdProducts[18].id,
      userId: createdUsers[1].id,
      rating: 5,
      comment: "Boost technology is amazing! Perfect for running.",
    },

    // Converse Chuck Taylor reviews
    {
      productId: createdProducts[19].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 4,
      comment: "Klasik canvas sneaker! Her zaman şık.",
    },
    {
      productId: createdProducts[19].id,
      userId: createdUsers[2].id,
      rating: 5,
      comment: "Classic canvas sneakers! Always stylish.",
    },

    // iPhone 14 Pro Max reviews
    {
      productId: createdProducts[20].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 5,
      comment: "A16 Bionic çip harika! Kamera sistemi mükemmel.",
    },
    {
      productId: createdProducts[20].id,
      userId: createdUsers[3].id,
      rating: 4,
      comment: "Great camera system! Fast performance.",
    },
  ];

  for (const review of reviews) {
    await prisma.review.create({
      data: review,
    });
  }

  console.log("✅ Database seeded successfully!");
  console.log(
    `📊 Created ${products.length} products with variants across 5 categories`
  );
  console.log(`👥 Created ${users.length} users with reviews`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
