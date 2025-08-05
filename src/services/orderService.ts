import { db } from "../db";

export const createOrder = async (userId: number, addressId: number) => {
  // Kullanıcının sepetini al
  const cartItems = await db.basketItem.findMany({
    where: { userId },
    include: {
      variant: {
        include: { product: true },
      },
    },
  });

  if (cartItems.length === 0) {
    throw new Error("Cart is empty");
  }

  // Toplam tutarı hesapla
  const total = cartItems.reduce((sum, item) => {
    const itemPrice = item.variant.product.price + item.variant.priceDiff;
    return sum + itemPrice * item.quantity;
  }, 0);

  // Sipariş oluştur
  const order = await db.order.create({
    data: {
      userId,
      addressId,
      total,
      items: {
        create: cartItems.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.variant.product.price + item.variant.priceDiff,
        })),
      },
    },
    include: {
      items: {
        include: {
          variant: {
            include: { product: true },
          },
        },
      },
      address: true,
    },
  });

  // Sepeti temizle
  await db.basketItem.deleteMany({
    where: { userId },
  });

  return order;
};

export const getOrderById = async (orderId: number, userId: number) => {
  return db.order.findFirst({
    where: {
      id: orderId,
      userId, // Güvenlik için userId kontrolü
    },
    include: {
      items: {
        include: {
          variant: {
            include: { product: true },
          },
        },
      },
      address: true,
    },
  });
};

export const getUserOrders = async (userId: number) => {
  return db.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          variant: {
            include: { product: true },
          },
        },
      },
      address: true,
    },
    orderBy: { createdAt: "desc" },
  });
};
