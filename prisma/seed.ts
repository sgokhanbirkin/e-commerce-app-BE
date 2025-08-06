import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
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

  const createdCategories: any[] = [];
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
      description:
        "Your perfect pack for everyday use and walks in the forest.",
      categoryId: mensClothingId,
      imageUrl:
        "https://www.vitruta.com/cdn/shop/files/fjallraven-kanken-classic-sirt-cantasi-black-317218.jpg?v=1742505968&width=860",
      variants: [
        {
          sku: "BACK-001-BLACK-S",
          attribute: "color",
          value: "Black",
          stock: 10,
          priceDiff: 0,
        },
        {
          sku: "BACK-001-BLACK-M",
          attribute: "color",
          value: "Black",
          stock: 12,
          priceDiff: 0,
        },
      ],
    },
    {
      title: "Men's Casual Premium Slim Fit T-Shirt",
      price: 22.3,
      description: "Slim-fitting style, contrast raglan long sleeve.",
      categoryId: mensClothingId,
      imageUrl: "https://m.media-amazon.com/images/I/61VeF8KT7CS._UY1000_.jpg",
      variants: [
        {
          sku: "TSHIRT-001-WHITE-M",
          attribute: "color",
          value: "White",
          stock: 20,
          priceDiff: 0,
        },
        {
          sku: "TSHIRT-001-BLACK-L",
          attribute: "color",
          value: "Black",
          stock: 15,
          priceDiff: 0,
        },
      ],
    },
    {
      title: "Mens Cotton Jacket",
      price: 55.99,
      description: "Great outerwear jackets for Spring/Autumn/Winter.",
      categoryId: mensClothingId,
      imageUrl:
        "https://cdn.beymen.com/mnresize/505/704/productimages/i413lggt.1xt_MP_da8b1010-2e3d-4472-a34e-c79fc4a7a3d8_1_75010376022301215122244512440_052.jpg",
      variants: [
        {
          sku: "JACKET-001-KHAKI-M",
          attribute: "color",
          value: "Khaki",
          stock: 8,
          priceDiff: 0,
        },
        {
          sku: "JACKET-001-NAVY-L",
          attribute: "color",
          value: "Navy",
          stock: 5,
          priceDiff: 0,
        },
      ],
    },
    {
      title: "Women's Lightweight Jacket",
      price: 39.99,
      description: "Lightweight windbreaker for your daily outfit.",
      categoryId: womensClothingId,
      imageUrl:
        "https://www.outbacktrading.com/cdn/shop/files/outback-trading-company-women-s-hattie-lightweight-jacket-32889742786694.jpg?v=1713361936&width=860",
      variants: [
        {
          sku: "JACKET-002-PINK-S",
          attribute: "color",
          value: "Pink",
          stock: 14,
          priceDiff: 0,
        },
        {
          sku: "JACKET-002-GREY-M",
          attribute: "color",
          value: "Grey",
          stock: 10,
          priceDiff: 0,
        },
      ],
    },
    {
      title: "Women's Cotton Shorts",
      price: 25.0,
      description: "Comfortable cotton shorts for summer days.",
      categoryId: womensClothingId,
      imageUrl:
        "https://tbfuk.com/cdn/shop/products/blackshortsss_900x.jpg?v=1629925341",
      variants: [
        {
          sku: "SHORTS-001-BLUE-S",
          attribute: "color",
          value: "Blue",
          stock: 20,
          priceDiff: 0,
        },
        {
          sku: "SHORTS-001-WHITE-M",
          attribute: "color",
          value: "White",
          stock: 18,
          priceDiff: 0,
        },
      ],
    },
    {
      title: "Fjallraven Foldsack No. 1 Backpack",
      price: 129.95,
      description: "Fits 15″ laptops and more.",
      categoryId: mensClothingId,
      imageUrl:
        "https://m.media-amazon.com/images/I/81zWnT1GY+L._UF1000,1000_QL80_.jpg",
      variants: [
        {
          sku: "BACK-002-GREEN-OS",
          attribute: "color",
          value: "Green",
          stock: 25,
          priceDiff: 0,
        },
      ],
    },
    {
      title: "Puma RS-X Sneakers",
      price: 89.99,
      description: "PUMA RS-X toys up 80s running-inspired vibe.",
      categoryId: shoesId,
      imageUrl:
        "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,e_sharpen/global/398202/02/sv01/fnd/TUR/w/1000/h/1000/fmt/png",
      variants: [
        {
          sku: "SNEAKERS-001-WHITE-9",
          attribute: "color",
          value: "White",
          stock: 30,
          priceDiff: 0,
        },
        {
          sku: "SNEAKERS-001-BLACK-10",
          attribute: "color",
          value: "Black",
          stock: 22,
          priceDiff: 0,
        },
      ],
    },
    {
      title: "Adidas Ultraboost Shoes",
      price: 179.99,
      description: "Comfort and performance for running.",
      categoryId: shoesId,
      imageUrl:
        "https://assets.adidas.com/images/w_383,h_383,f_auto,q_auto,fl_lossy,c_fill,g_auto/73f271fa2fb24c4cbd2ce0063da51a5a_9366/ultraboost-5-ayakkabi.jpg",
      variants: [
        {
          sku: "SNEAKERS-002-BLACK-8",
          attribute: "color",
          value: "Core Black",
          stock: 12,
          priceDiff: 0,
        },
        {
          sku: "SNEAKERS-002-NAVY-9",
          attribute: "color",
          value: "Collegiate Navy",
          stock: 15,
          priceDiff: 0,
        },
      ],
    },
    {
      title: "Converse Chuck Taylor",
      price: 59.99,
      description: "Classic unisex canvas high top sneakers.",
      categoryId: shoesId,
      imageUrl:
        "https://akn-ss.a-cdn.akinoncloud.com/products/2021/01/26/296103/824ee32c-9382-44c1-b1f0-72851d91e751_size3840_cropCenter.jpg",
      variants: [
        {
          sku: "SNEAKERS-003-BLACK-7",
          attribute: "color",
          value: "Black",
          stock: 18,
          priceDiff: 0,
        },
        {
          sku: "SNEAKERS-003-WHITE-8",
          attribute: "color",
          value: "White",
          stock: 20,
          priceDiff: 0,
        },
      ],
    },
    {
      title: "iPhone 14 Pro Max",
      price: 1099.0,
      description: "Apple smartphone with A16 Bionic chip.",
      categoryId: electronicsId,
      imageUrl:
        "https://reimg-teknosa-cloud-prod.mncdn.com/mnresize/600/600/productimage/790182765/790182765_0_MC/7df1da63fd8a4527981660234f149320.jpg",
      variants: [
        {
          sku: "PHONE-001-BLACK-128",
          attribute: "color",
          value: "Space Black",
          stock: 5,
          priceDiff: 0,
        },
        {
          sku: "PHONE-001-SILVER-256",
          attribute: "color",
          value: "Silver",
          stock: 3,
          priceDiff: 100,
        },
      ],
    },
    {
      title: "Samsung Galaxy S23 Ultra",
      price: 1199.0,
      description: "Samsung flagship with 200MP camera.",
      categoryId: electronicsId,
      imageUrl:
        "https://cdn.dsmcdn.com/mnresize/420/620/ty1426/product/media/images/prod/QC/20240718/09/1d8068d2-5fa3-3e01-aaa5-2b9666762c7c/1_org_zoom.jpg",
      variants: [
        {
          sku: "PHONE-002-BLACK-256",
          attribute: "color",
          value: "Phantom Black",
          stock: 4,
          priceDiff: 0,
        },
        {
          sku: "PHONE-002-GREEN-512",
          attribute: "color",
          value: "Green",
          stock: 2,
          priceDiff: 200,
        },
      ],
    },
    {
      title: "Google Pixel 7",
      price: 599.0,
      description: "AI-powered camera and Android 13.",
      categoryId: electronicsId,
      imageUrl: "https://cdn.akakce.com/z/google/google-piksel-7.jpg",
      variants: [
        {
          sku: "PHONE-003-SNOW-128",
          attribute: "color",
          value: "Snow",
          stock: 10,
          priceDiff: 0,
        },
        {
          sku: "PHONE-003-OBSIDIAN-256",
          attribute: "color",
          value: "Obsidian",
          stock: 8,
          priceDiff: 100,
        },
      ],
    },
    {
      title: "Sony WH-1000XM5 Headphones",
      price: 349.99,
      description: "Industry-leading noise canceling.",
      categoryId: electronicsId,
      imageUrl:
        "https://m.media-amazon.com/images/I/514vwxueu7L._UF1000,1000_QL80_.jpg",
      variants: [
        {
          sku: "HEADPHONES-001-BLACK-OS",
          attribute: "color",
          value: "Black",
          stock: 15,
          priceDiff: 0,
        },
      ],
    },
    {
      title: "Dell XPS 13 Laptop",
      price: 999.99,
      description: "Ultra-portable laptop with 13.4″ display.",
      categoryId: electronicsId,
      imageUrl:
        "https://cdn.akakce.com/z/dell/dell-xps-13-plus-9320-xps139320adlp2474-i7-1260p-16-gb-1-tb-ssd-iris-xe-graphics-13-4-notebook.jpg",
      variants: [
        {
          sku: "LAPTOP-001-SILVER-256",
          attribute: "color",
          value: "Platinum Silver",
          stock: 6,
          priceDiff: 0,
        },
        {
          sku: "LAPTOP-001-BLACK-512",
          attribute: "color",
          value: "Black",
          stock: 4,
          priceDiff: 200,
        },
      ],
    },
    {
      title: "Nike Air Force 1",
      price: 90.0,
      description: "The legend lives on in the AF-1 '07.",
      categoryId: shoesId,
      imageUrl:
        "https://img.sportinn.com.tr/nike-air-force-1-07-erkek-sneaker-ayakkabi-cw2288-111-153736-43-B.jpg",
      variants: [
        {
          sku: "SNEAKERS-004-WHITE-9",
          attribute: "color",
          value: "White",
          stock: 20,
          priceDiff: 0,
        },
        {
          sku: "SNEAKERS-004-BLACK-10",
          attribute: "color",
          value: "Black",
          stock: 18,
          priceDiff: 0,
        },
      ],
    },
    {
      title: "Levi's 501 Original Jeans",
      price: 59.99,
      description: "Iconic straight leg jeans.",
      categoryId: mensClothingId,
      imageUrl: "https://i.ebayimg.com/images/g/GpQAAOSwMdhmXDFM/s-l1200.jpg",
      variants: [
        {
          sku: "JEANS-001-BLUE-32",
          attribute: "color",
          value: "Blue",
          stock: 25,
          priceDiff: 0,
        },
        {
          sku: "JEANS-001-BLACK-34",
          attribute: "color",
          value: "Black",
          stock: 20,
          priceDiff: 0,
        },
      ],
    },
    {
      title: "Ray-Ban Wayfarer Sunglasses",
      price: 150.0,
      description: "Classic acetate sunglasses.",
      categoryId: accessoriesId,
      imageUrl:
        "https://tr.glassesstation.com/media/thumbs/1500x937.5/media/product_images/Ray-Ban-Sunglasses-RBR0502S-6707GR-qtfw1500fh937.5.jpg",
      variants: [
        {
          sku: "SUNGLASSES-001-TORTOISE-OS",
          attribute: "color",
          value: "Tortoise",
          stock: 12,
          priceDiff: 0,
        },
      ],
    },
    {
      title: "The North Face Puffer Jacket",
      price: 199.99,
      description: "Warm puffer jacket for cold weather.",
      categoryId: womensClothingId,
      imageUrl:
        "https://stn-atasun.mncdn.com/mnresize/1500/1500/Content/media/ProductImg/original/gu021637-rb-2140-901-5022150-638682294388171884.png?v=r7n1d335",
      variants: [
        {
          sku: "JACKET-003-RED-M",
          attribute: "color",
          value: "Red",
          stock: 8,
          priceDiff: 0,
        },
        {
          sku: "JACKET-003-BLACK-L",
          attribute: "color",
          value: "Black",
          stock: 5,
          priceDiff: 0,
        },
      ],
    },
    {
      title: "Apple MacBook Air M2",
      price: 1199.0,
      description: "Apple M2 chip with 8-core CPU.",
      categoryId: electronicsId,
      imageUrl:
        "https://reimg-teknosa-cloud-prod.mncdn.com/mnresize/600/600/productimage/125036283/125036283_0_MC/97111077.jpg",
      variants: [
        {
          sku: "LAPTOP-002-MIDNIGHT-256",
          attribute: "color",
          value: "Midnight",
          stock: 3,
          priceDiff: 0,
        },
        {
          sku: "LAPTOP-002-STARLIGHT-512",
          attribute: "color",
          value: "Starlight",
          stock: 2,
          priceDiff: 200,
        },
      ],
    },
  ];

  const createdProducts: any[] = [];
  for (const p of productsData) {
    const product = await prisma.product.create({
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
    createdProducts.push(product);
  }

  // Create sample users for reviews
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
    {
      email: "david@example.com",
      passwordHash: await bcrypt.hash("password123", 10),
      name: "David Brown",
      phone: "+1234567894",
    },
  ];

  const createdUsers: any[] = [];
  for (const userData of users) {
    const user = await prisma.user.create({
      data: userData,
    });
    createdUsers.push(user);
  }

  // Create sample reviews for products (all products with multiple reviews)
  const reviews = [
    // Fjallraven Backpack reviews (index 0)
    {
      productId: createdProducts[0].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 5,
      comment: "Mükemmel kalite! Günlük kullanım için ideal.",
    },
    {
      productId: createdProducts[0].id,
      userId: createdUsers[1].id,
      rating: 4,
      comment: "Great backpack, very durable. Love the design.",
    },
    {
      productId: createdProducts[0].id,
      userId: createdUsers[2].id,
      rating: 5,
      comment: "Best backpack I've ever owned. Highly recommend!",
    },

    // Men's T-Shirt reviews (index 1)
    {
      productId: createdProducts[1].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 4,
      comment: "Rahat ve kaliteli kumaş. Tavsiye ederim.",
    },
    {
      productId: createdProducts[1].id,
      userId: createdUsers[3].id,
      rating: 4,
      comment: "Comfortable and fits well. Good quality material.",
    },
    {
      productId: createdProducts[1].id,
      userId: createdUsers[4].id,
      rating: 3,
      comment: "Decent shirt, but runs a bit small.",
    },

    // Mens Cotton Jacket reviews (index 2)
    {
      productId: createdProducts[2].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 5,
      comment: "Harika ceket! Tüm mevsimler için uygun.",
    },
    {
      productId: createdProducts[2].id,
      userId: createdUsers[1].id,
      rating: 4,
      comment: "Great jacket for all seasons. Good quality.",
    },
    {
      productId: createdProducts[2].id,
      userId: createdUsers[2].id,
      rating: 5,
      comment: "Perfect fit and very warm. Highly recommend!",
    },

    // Women's Lightweight Jacket reviews (index 3)
    {
      productId: createdProducts[3].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 4,
      comment: "Hafif ve rahat. İlkbahar için mükemmel.",
    },
    {
      productId: createdProducts[3].id,
      userId: createdUsers[2].id,
      rating: 4,
      comment: "Lightweight and comfortable. Perfect for spring.",
    },
    {
      productId: createdProducts[3].id,
      userId: createdUsers[3].id,
      rating: 5,
      comment: "Love this jacket! Great for layering.",
    },

    // Women's Cotton Shorts reviews (index 4)
    {
      productId: createdProducts[4].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 4,
      comment: "Yaz için rahat şortlar. Kaliteli pamuk.",
    },
    {
      productId: createdProducts[4].id,
      userId: createdUsers[4].id,
      rating: 4,
      comment: "Comfortable shorts for summer. Good quality cotton.",
    },
    {
      productId: createdProducts[4].id,
      userId: createdUsers[1].id,
      rating: 3,
      comment: "Decent shorts, but could be longer.",
    },

    // Fjallraven Foldsack Backpack reviews (index 5)
    {
      productId: createdProducts[5].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 5,
      comment: "15 inç laptop için mükemmel boyut!",
    },
    {
      productId: createdProducts[5].id,
      userId: createdUsers[2].id,
      rating: 4,
      comment: "Great size for my laptop. Good quality.",
    },

    // Puma RS-X Sneakers reviews (index 6)
    {
      productId: createdProducts[6].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 4,
      comment: "80'ler tarzı harika sneaker!",
    },
    {
      productId: createdProducts[6].id,
      userId: createdUsers[1].id,
      rating: 5,
      comment: "Love the retro design! Very comfortable.",
    },

    // Adidas Ultraboost reviews (index 7)
    {
      productId: createdProducts[7].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 5,
      comment: "Koşu için mükemmel! Çok rahat.",
    },
    {
      productId: createdProducts[7].id,
      userId: createdUsers[3].id,
      rating: 4,
      comment: "Great for running. Excellent comfort.",
    },

    // Converse Chuck Taylor reviews (index 8)
    {
      productId: createdProducts[8].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 4,
      comment: "Klasik tasarım! Her zaman şık.",
    },
    {
      productId: createdProducts[8].id,
      userId: createdUsers[4].id,
      rating: 5,
      comment: "Classic design! Goes with everything.",
    },

    // iPhone 14 Pro Max reviews (index 9)
    {
      productId: createdProducts[9].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 5,
      comment: "A16 Bionic çip harika! Kamera sistemi mükemmel.",
    },
    {
      productId: createdProducts[9].id,
      userId: createdUsers[1].id,
      rating: 4,
      comment: "Great camera system. Fast performance.",
    },
    {
      productId: createdProducts[9].id,
      userId: createdUsers[2].id,
      rating: 5,
      comment: "Best iPhone ever! Love the camera.",
    },

    // Samsung Galaxy S23 Ultra reviews (index 10)
    {
      productId: createdProducts[10].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 4,
      comment: "200MP kamera harika! S Pen çok kullanışlı.",
    },
    {
      productId: createdProducts[10].id,
      userId: createdUsers[3].id,
      rating: 5,
      comment: "Amazing camera! S Pen is very useful.",
    },

    // Google Pixel 7 reviews (index 11)
    {
      productId: createdProducts[11].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 4,
      comment: "AI destekli kamera harika! Android 13 çok akıcı.",
    },
    {
      productId: createdProducts[11].id,
      userId: createdUsers[4].id,
      rating: 4,
      comment: "Great AI camera features. Smooth Android 13.",
    },

    // Sony WH-1000XM5 reviews (index 12)
    {
      productId: createdProducts[12].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 5,
      comment: "Sektörün en iyi noise canceling! Ses kalitesi mükemmel.",
    },
    {
      productId: createdProducts[12].id,
      userId: createdUsers[1].id,
      rating: 5,
      comment: "Best noise canceling! Amazing sound quality.",
    },

    // Dell XPS 13 reviews (index 13)
    {
      productId: createdProducts[13].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 4,
      comment: "Ultra-portable laptop! 13.4 inç ekran harika.",
    },
    {
      productId: createdProducts[13].id,
      userId: createdUsers[2].id,
      rating: 5,
      comment: "Perfect for work! Great battery life.",
    },

    // Nike Air Force 1 reviews (index 14)
    {
      productId: createdProducts[14].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 4,
      comment: "Efsane AF-1! Her zaman şık.",
    },
    {
      productId: createdProducts[14].id,
      userId: createdUsers[3].id,
      rating: 5,
      comment: "Legendary design! Always stylish.",
    },

    // Levi's 501 Jeans reviews (index 15)
    {
      productId: createdProducts[15].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 4,
      comment: "Klasik straight-fit! Denim kalitesi harika.",
    },
    {
      productId: createdProducts[15].id,
      userId: createdUsers[4].id,
      rating: 4,
      comment: "Classic fit! Great denim quality.",
    },

    // Ray-Ban Wayfarer reviews (index 16)
    {
      productId: createdProducts[16].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 5,
      comment: "Klasik acetate güneş gözlüğü! Her zaman şık.",
    },
    {
      productId: createdProducts[16].id,
      userId: createdUsers[1].id,
      rating: 4,
      comment: "Classic design! Perfect for any occasion.",
    },

    // The North Face Puffer Jacket reviews (index 17)
    {
      productId: createdProducts[17].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 5,
      comment: "Soğuk hava için mükemmel! Çok sıcak.",
    },
    {
      productId: createdProducts[17].id,
      userId: createdUsers[2].id,
      rating: 4,
      comment: "Perfect for cold weather! Very warm.",
    },

    // Apple MacBook Air M2 reviews (index 18)
    {
      productId: createdProducts[18].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 5,
      comment: "M2 çip harika! 8-core CPU çok hızlı.",
    },
    {
      productId: createdProducts[18].id,
      userId: createdUsers[3].id,
      rating: 5,
      comment: "M2 chip is amazing! 8-core CPU is very fast.",
    },

    // Kindle Paperwhite reviews (index 19)
    {
      productId: createdProducts[19].id,
      userId: createdUsers[0].id, // Gokhan
      rating: 4,
      comment: "Su geçirmez e-reader! 8GB depolama yeterli.",
    },
    {
      productId: createdProducts[19].id,
      userId: createdUsers[4].id,
      rating: 4,
      comment: "Waterproof e-reader! 8GB storage is enough.",
    },
  ];

  for (const review of reviews) {
    await prisma.review.create({
      data: review,
    });
  }

  console.log("🎉 Seed data created with reviews!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
