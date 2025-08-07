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

  let result;
  if (existingItem) {
    // Mevcut miktarı güncelle
    result = await db.basketItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
      include: { variant: { include: { product: true } } },
    });
  } else {
    // Yeni sepet öğesi oluştur
    const createData = userId
      ? { userId, variantId, quantity }
      : { guestId: guestId!, variantId, quantity };

    result = await db.basketItem.create({
      data: createData,
      include: { variant: { include: { product: true } } },
    });
  }

  // Return in the expected format
  return {
    id: result.id.toString(),
    productId: result.variant.product.id.toString(),
    quantity: result.quantity,
    product: {
      id: result.variant.product.id,
      title: result.variant.product.title,
      description: result.variant.product.description,
      imageUrl: result.variant.product.imageUrl,
      price: result.variant.product.price,
    },
    variantId: result.variantId.toString(),
  };
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

  // Return in the expected format
  return basketItems.map((item) => ({
    id: item.id.toString(),
    productId: item.variant.product.id.toString(),
    quantity: item.quantity,
    product: {
      id: item.variant.product.id,
      title: item.variant.product.title,
      description: item.variant.product.description,
      imageUrl: item.variant.product.imageUrl,
      price: item.variant.product.price,
    },
    variantId: item.variantId.toString(),
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

  // Check if the item exists before trying to delete it
  const existingItem = await db.basketItem.findFirst({
    where: whereClause,
  });

  if (!existingItem) {
    throw new Error("Cart item not found");
  }

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

export const updateCartItemQuantity = async (
  userId: number | null,
  itemId: number,
  quantity: number,
  guestId?: string
) => {
  const whereClause = userId
    ? { id: itemId, userId }
    : { id: itemId, guestId: guestId! };

  // Check if the item exists
  const existingItem = await db.basketItem.findFirst({
    where: whereClause,
    include: { variant: { include: { product: true } } },
  });

  if (!existingItem) {
    throw new Error("Cart item not found");
  }

  // Check stock availability
  if (existingItem.variant.stock < quantity) {
    throw new Error("Insufficient stock");
  }

  // Update the quantity
  const updatedItem = await db.basketItem.update({
    where: whereClause,
    data: { quantity },
    include: { variant: { include: { product: true } } },
  });

  // Return in the expected format
  return {
    id: updatedItem.id.toString(),
    productId: updatedItem.variant.product.id.toString(),
    quantity: updatedItem.quantity,
    product: {
      id: updatedItem.variant.product.id,
      title: updatedItem.variant.product.title,
      description: updatedItem.variant.product.description,
      imageUrl: updatedItem.variant.product.imageUrl,
      price: updatedItem.variant.product.price,
    },
    variantId: updatedItem.variantId.toString(),
  };
};
