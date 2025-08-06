import { db } from "../db";

export const addToCart = async (
  userId: number | null,
  variantId: number,
  quantity: number,
  guestId?: string
) => {
  // Önce variant'ı kontrol et
  const variant = await db.productVariant.findUnique({
    where: { id: variantId },
    include: { product: true },
  });

  if (!variant) throw new Error("Variant not found");
  if (variant.stock < quantity) throw new Error("Insufficient stock");

  // Kullanıcının sepetinde bu variant var mı kontrol et
  const whereClause = userId
    ? { userId, variantId }
    : { guestId: guestId!, variantId };
  const existingItem = await db.basketItem.findFirst({
    where: whereClause,
  });

  if (existingItem) {
    // Mevcut miktarı güncelle
    return db.basketItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
      include: { variant: { include: { product: true } } },
    });
  } else {
    // Yeni sepet öğesi oluştur
    const createData = userId
      ? { userId, variantId, quantity }
      : { guestId: guestId!, variantId, quantity };

    return db.basketItem.create({
      data: createData,
      include: { variant: { include: { product: true } } },
    });
  }
};

export const getCart = async (userId: number | null, guestId?: string) => {
  const whereClause = userId ? { userId } : { guestId: guestId! };
  const basketItems = await db.basketItem.findMany({
    where: whereClause,
    include: {
      variant: {
        include: { product: true },
      },
    },
  });

  // İstenen formata dönüştür
  return basketItems.map((item) => ({
    id: item.id,
    variantId: item.variantId,
    quantity: item.quantity,
    product: {
      id: item.variant.product.id,
      title: item.variant.product.title,
      description: item.variant.product.description,
      imageUrl: item.variant.product.imageUrl,
      price: item.variant.product.price,
    },
    variant: {
      id: item.variant.id,
      name: item.variant.attribute,
      value: item.variant.value,
      price: item.variant.product.price + item.variant.priceDiff,
    },
  }));
};

export const removeFromCart = async (
  userId: number | null,
  itemId: number,
  guestId?: string
) => {
  const whereClause = userId
    ? { id: itemId, userId }
    : { id: itemId, guestId: guestId! };

  return db.basketItem.delete({
    where: whereClause,
  });
};

export const clearCart = async (userId: number | null, guestId?: string) => {
  const whereClause = userId ? { userId } : { guestId: guestId! };
  return db.basketItem.deleteMany({
    where: whereClause,
  });
};
