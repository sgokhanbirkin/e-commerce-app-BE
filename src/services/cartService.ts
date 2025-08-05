import { db } from "../db";

export const addToCart = async (
  userId: number,
  variantId: number,
  quantity: number
) => {
  // Önce variant'ı kontrol et
  const variant = await db.productVariant.findUnique({
    where: { id: variantId },
    include: { product: true },
  });

  if (!variant) throw new Error("Variant not found");
  if (variant.stock < quantity) throw new Error("Insufficient stock");

  // Kullanıcının sepetinde bu variant var mı kontrol et
  const existingItem = await db.basketItem.findFirst({
    where: {
      userId,
      variantId,
    },
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
    return db.basketItem.create({
      data: { userId, variantId, quantity },
      include: { variant: { include: { product: true } } },
    });
  }
};

export const getCart = async (userId: number) => {
  return db.basketItem.findMany({
    where: { userId },
    include: {
      variant: {
        include: { product: true },
      },
    },
  });
};

export const removeFromCart = async (userId: number, itemId: number) => {
  return db.basketItem.delete({
    where: {
      id: itemId,
      userId, // Güvenlik için userId kontrolü
    },
  });
};

export const clearCart = async (userId: number) => {
  return db.basketItem.deleteMany({
    where: { userId },
  });
};
