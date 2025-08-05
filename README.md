# 🛍️ Kayra Export E-Commerce Backend

Modern e-ticaret API'si - Node.js, TypeScript, Express.js ve Prisma ile geliştirilmiş.

## 🚀 Özellikler

### 🔐 **Authentication & Authorization**
- JWT tabanlı kimlik doğrulama
- Kullanıcı kayıt ve giriş
- Güvenli şifre hashleme (bcrypt)
- Korumalı route'lar

### 👤 **User Management**
- Kullanıcı profili yönetimi
- Adres yönetimi (çoklu adres desteği)
- Kullanıcı sipariş geçmişi

### 📦 **Product Management**
- Ürün CRUD işlemleri
- Kategori sistemi (hiyerarşik)
- Ürün varyantları (renk, boyut, stok)
- Arama ve filtreleme
- Sayfalama desteği

### ⭐ **Review System**
- Ürün değerlendirme ve yorumlar
- 1-5 arası puanlama sistemi
- Kullanıcı bazlı yorumlar

### 🛒 **Cart & Order System**
- Sepet yönetimi
- Sipariş oluşturma
- Sipariş geçmişi
- Stok kontrolü

### 🛡️ **Security & Performance**
- Rate limiting
- CORS yapılandırması
- Helmet güvenlik header'ları
- Request logging (Pino)
- Input validation (Zod)

## 🏗️ **Mimari**

```
src/
├── controllers/     # Request handlers
├── services/        # Business logic
├── repositories/    # Data access layer
├── middleware/      # Express middleware
├── routes/          # Route definitions
├── types/           # TypeScript declarations
└── __tests__/       # Test files
```

## 📋 **API Endpoints**

### 🔐 **Auth & User**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Yeni kullanıcı kaydı |
| POST | `/api/auth/login` | Kullanıcı girişi |
| GET | `/api/auth/users/me` | Kullanıcı profili |
| POST | `/api/auth/users/me/address` | Adres ekleme |

### 📦 **Products**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Ürün listesi (filtreleme, arama, sayfalama) |
| GET | `/api/products/:id` | Tek ürün detayı |
| GET | `/api/products/:id/variants` | Ürün varyantları |
| POST | `/api/products` | Yeni ürün oluşturma |
| PUT | `/api/products/:id` | Ürün güncelleme |
| DELETE | `/api/products/:id` | Ürün silme |

### ⭐ **Reviews**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/products/:id/reviews` | Yorum ekleme |
| GET | `/api/products/:id/reviews` | Yorum listesi |

### 🛒 **Cart & Orders**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/cart` | Sepete ürün ekleme |
| GET | `/api/cart` | Sepet içeriği |
| DELETE | `/api/cart/:itemId` | Sepetten ürün silme |
| POST | `/api/orders` | Sipariş oluşturma |
| GET | `/api/orders/:id` | Sipariş detayı |
| GET | `/api/orders/users/me/orders` | Kullanıcı sipariş geçmişi |

### 🛠️ **Utility**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Sağlık kontrolü |
| GET | `/api-docs` | Swagger dokümantasyonu |

## 🛠️ **Teknolojiler**

- **Runtime**: Node.js 20, TypeScript 5
- **Framework**: Express.js
- **Database**: SQLite (Prisma ORM)
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI
- **Logging**: Pino
- **Testing**: Jest + Supertest
- **Package Manager**: pnpm

## 🚀 **Hızlı Başlangıç**

### 1. **Kurulum**
```bash
# Bağımlılıkları yükle
pnpm install

# Environment variables'ları ayarla
cp .env.example .env
# .env dosyasını düzenle
```

### 2. **Veritabanı Kurulumu**
```bash
# Migration'ları çalıştır
npx prisma migrate dev

# Seed data ekle (opsiyonel)
npx prisma db seed
```

### 3. **Geliştirme**
```bash
# Development server'ı başlat
pnpm dev

# API: http://localhost:8080
# Swagger: http://localhost:8080/api-docs
```

### 4. **Test**
```bash
# Tüm testleri çalıştır
pnpm test

# Coverage raporu
pnpm test:coverage

# E2E testleri
pnpm test:e2e
```

## 📦 **Environment Variables**

```env
PORT=8080
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-in-production"
CORS_ORIGIN="*"
LOG_LEVEL="info"
NODE_ENV="development"
```

## 🗄️ **Veritabanı Şeması**

### **Ana Modeller**
- **User**: Kullanıcı bilgileri
- **Address**: Teslimat adresleri
- **Category**: Ürün kategorileri
- **Product**: Ana ürün bilgileri
- **ProductVariant**: Ürün varyantları
- **Order**: Sipariş bilgileri
- **OrderItem**: Sipariş detayları
- **Review**: Kullanıcı yorumları
- **BasketItem**: Sepet öğeleri

## 🧪 **Test Stratejisi**

### **Test Türleri**
- **Unit Tests**: Service ve utility fonksiyonları
- **Integration Tests**: API endpoint'leri
- **E2E Tests**: Tam kullanıcı senaryoları

### **Test Coverage**
- Hedef: %80+ coverage
- Kritik business logic için %100 coverage

## 🐳 **Docker**

### **Build**
```bash
docker build -t ecommerce-backend .
```

### **Run**
```bash
docker run -p 8080:8080 ecommerce-backend
```

### **Docker Compose**
```bash
docker-compose up -d
```

## 🔄 **CI/CD**

GitHub Actions ile otomatik:
- ✅ Lint kontrolü
- ✅ Test çalıştırma
- ✅ Build işlemi
- ✅ Docker image oluşturma

## 📊 **Monitoring & Logging**

- **Request Logging**: Pino ile structured logging
- **Error Tracking**: Global error handler
- **Health Check**: `/health` endpoint
- **Performance**: Rate limiting ve caching

## 🔒 **Güvenlik**

- **Authentication**: JWT tokens
- **Authorization**: Role-based access
- **Input Validation**: Zod schemas
- **Rate Limiting**: API abuse koruması
- **Security Headers**: Helmet middleware
- **CORS**: Cross-origin resource sharing

## 📈 **Performance**

- **Database**: Prisma query optimization
- **Caching**: Response caching (gelecek)
- **Pagination**: API response pagination
- **Compression**: Response compression (gelecek)

## 🤝 **Katkıda Bulunma**

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'feat: add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 **Commit Convention**

```
<type>(<scope>): <description>

feat: yeni özellik
fix: hata düzeltmesi
docs: dokümantasyon
style: kod formatı
refactor: kod refactoring
test: test ekleme/düzenleme
chore: build, config değişiklikleri
```

## 📄 **Lisans**

Bu proje MIT lisansı altında lisanslanmıştır.

---

**Geliştirici**: Kayra Export Team  
**Versiyon**: 1.0.0  
**Son Güncelleme**: 2024 