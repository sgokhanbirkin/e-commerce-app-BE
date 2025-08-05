# 🛒 E-Commerce Backend API

## 🚦 Hızlı Başlangıç (Quick Start)

### 1. Depoyu Klonla
```bash
git clone <repo-url>
cd <proje-klasörü>
```

### 2. Ortam Değişkenlerini Ayarla
`.env.example` dosyasını kopyala ve kendi değerlerini gir:
```bash
cp .env.example .env
```

**.env.example içeriği:**
```env
PORT=8080
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-in-production"
CORS_ORIGIN="*"
LOG_LEVEL="info"
NODE_ENV="development"
```

### 3. Bağımlılıkları Kur
```bash
pnpm install
```

### 4. Veritabanı Migrasyonunu Uygula
```bash
npx prisma migrate dev
```

### 5. Geliştirme Sunucusunu Başlat
```bash
pnpm dev
```

### 6. API Dokümantasyonuna Göz At
Swagger UI: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

---

# (Aşağıda mevcut README içeriği devam eder)

Modern Node.js, TypeScript, Prisma ve Express.js kullanılarak geliştirilmiş e-ticaret backend API'si.

## 🚀 Özellikler

### 🔐 Kimlik Doğrulama & Güvenlik
- **JWT Authentication** - Register/Login endpoint'leri
- **bcrypt** - Şifre hashleme
- **Helmet** - Güvenlik header'ları
- **CORS** - Cross-origin istek desteği
- **Rate Limiting** - API rate limiting (100 req/dakika)
- **Request Validation** - Zod ile input validation

### 📊 Veritabanı & ORM
- **Prisma ORM** - Type-safe database operations
- **SQLite** - Geliştirme için hafif veritabanı
- **Migration System** - Otomatik schema migration

### 🛠️ API Endpoints

#### 🔐 Authentication
```
POST /api/auth/register - Kullanıcı kaydı
POST /api/auth/login    - Kullanıcı girişi
```

#### 📦 Products
```
GET    /api/products     - Tüm ürünleri listele
GET    /api/products/:id - Tek ürün detayı
POST   /api/products     - Yeni ürün oluştur
PUT    /api/products/:id - Ürün güncelle
DELETE /api/products/:id - Ürün sil
```

#### 🛒 Basket
```
GET    /api/basket       - Sepet içeriğini listele
POST   /api/basket       - Sepete ürün ekle
DELETE /api/basket/:id   - Sepetten ürün çıkar
```

#### 📋 Utility
```
GET /health     - Health check
GET /api-docs   - Swagger API dokümantasyonu
```

### 🏗️ Proje Yapısı

```
src/
├── controllers/          # Request handlers
│   ├── productsController.ts
│   ├── basketController.ts
│   └── authController.ts
├── services/            # Business logic
│   ├── productsService.ts
│   ├── basketService.ts
│   └── authService.ts
├── repositories/        # Data access layer
│   └── product.repository.ts
├── routes/             # API routes
│   ├── products.ts
│   ├── basket.ts
│   ├── auth.ts
│   └── health.ts
├── middleware/         # Express middleware
│   ├── asyncHandler.ts
│   ├── errorHandler.ts
│   ├── authMiddleware.ts
│   ├── validation.ts
│   ├── rateLimiter.ts
│   └── logger.ts
├── __tests__/         # Test dosyaları
│   └── products.e2e.test.ts
├── types/             # TypeScript declarations
│   ├── swagger-ui-express.d.ts
│   └── swagger-jsdoc.d.ts
├── db.ts              # Prisma client
├── swagger.ts         # Swagger configuration
└── main.ts            # Application entry point
```

## 🛠️ Teknolojiler

- **Runtime**: Node.js 20
- **Language**: TypeScript 5
- **Framework**: Express.js 5
- **ORM**: Prisma 6
- **Database**: SQLite (dev)
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **Logging**: Pino
- **Testing**: Jest + Supertest
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, Rate Limiting
- **Package Manager**: pnpm

## 🚀 Kurulum

### Gereksinimler
- Node.js 20+
- pnpm

### Adımlar

1. **Bağımlılıkları kur**
```bash
pnpm install
```

2. **Environment variables ayarla**
```bash
cp .env.example .env
```

3. **Veritabanını hazırla**
```bash
npx prisma migrate dev
```

4. **Uygulamayı başlat**
```bash
# Development
pnpm dev

# Production
pnpm build
pnpm start
```

## 🧪 Test

```bash
# Tüm testleri çalıştır
pnpm test

# Test coverage
pnpm test:coverage

# E2E testler
pnpm test:e2e
```

## 📚 API Dokümantasyonu

Swagger UI: `http://localhost:8080/api-docs`

## 🐳 Docker

```bash
# Build image
docker build -t ecommerce-backend .

# Run container
docker run -p 8080:8080 ecommerce-backend

# Docker Compose
docker-compose up
```

## 🔧 Environment Variables

```env
PORT=8080
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
CORS_ORIGIN="*"
LOG_LEVEL="info"
```

## 📊 Veritabanı Şeması

### Product Model
```prisma
model Product {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  price       Float
  imageUrl    String?
  category    String?
  isNew       Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  basketItems BasketItem[]
}
```

### BasketItem Model
```prisma
model BasketItem {
  id        Int     @id @default(autoincrement())
  productId Int
  quantity  Int     @default(1)
  Product   Product @relation(fields: [productId], references: [id])
}
```

## 🔒 Güvenlik Özellikleri

- **Input Validation**: Zod ile request validation
- **Rate Limiting**: 100 request/dakika
- **CORS**: Cross-origin istek kontrolü
- **Helmet**: Güvenlik header'ları
- **JWT**: Token tabanlı authentication
- **bcrypt**: Güvenli şifre hashleme

## 📈 Monitoring & Logging

- **Pino Logger**: Yapılandırılabilir log seviyesi
- **Request Logging**: Otomatik request/response logging
- **Error Handling**: Global error middleware
- **Health Check**: `/health` endpoint

## 🚀 Production Deployment

### Docker ile
```bash
docker build -t ecommerce-backend .
docker run -d -p 8080:8080 ecommerce-backend
```

### Environment Variables
```bash
NODE_ENV=production
DATABASE_URL="your-production-db-url"
JWT_SECRET="your-production-secret"
CORS_ORIGIN="https://your-frontend-domain.com"
```

## 🤝 Katkıda Bulunma

1. Fork yap
2. Feature branch oluştur (`git checkout -b feature/amazing-feature`)
3. Commit yap (`git commit -m 'Add amazing feature'`)
4. Push yap (`git push origin feature/amazing-feature`)
5. Pull Request oluştur

## 📄 Lisans

MIT License

## 👥 Geliştirici

Bu proje modern backend geliştirme pratikleri kullanılarak geliştirilmiştir:
- SOLID prensipleri
- 12 Faktör App metodolojisi
- Type-safe development
- Comprehensive testing
- Production-ready configuration 