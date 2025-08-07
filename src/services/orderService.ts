import { db } from "../db";

interface CartItem {
  variantId: number;
  quantity: number;
}

interface Address {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  postal: string;
  country: string;
  phone?: string;
}

interface PaymentInfo {
  method: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
}

export const createOrder = async (
  userId: number,
  items: CartItem[],
  shipping: Address,
  payment: PaymentInfo
) => {
  if (items.length === 0) {
    throw new Error("Order must contain at least one item");
  }

  // Validate all variants exist and have sufficient stock
  for (const item of items) {
    const variant = await db.productVariant.findUnique({
      where: { id: item.variantId },
      include: { product: true },
    });

    if (!variant) {
      throw new Error(`Variant ${item.variantId} not found`);
    }

    if (variant.stock < item.quantity) {
      throw new Error(`Insufficient stock for variant ${item.variantId}`);
    }
  }

  // Calculate total
  let total = 0;
  const validatedItems = [];

  for (const item of items) {
    const variant = await db.productVariant.findUnique({
      where: { id: item.variantId },
      include: { product: true },
    });

    const unitPrice = variant!.product.price + variant!.priceDiff;
    const itemTotal = unitPrice * item.quantity;
    total += itemTotal;

    validatedItems.push({
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice,
    });
  }

  // Create or find address
  let addressId: number;
  const existingAddress = await db.address.findFirst({
    where: {
      userId,
      label: shipping.label,
      line1: shipping.line1,
      city: shipping.city,
      postal: shipping.postal,
      country: shipping.country,
    },
  });

  if (existingAddress) {
    addressId = existingAddress.id;
  } else {
    const newAddress = await db.address.create({
      data: {
        userId,
        label: shipping.label,
        line1: shipping.line1,
        line2: shipping.line2,
        city: shipping.city,
        postal: shipping.postal,
        country: shipping.country,
        phone: shipping.phone,
      },
    });
    addressId = newAddress.id;
  }

  // Create order
  const order = await db.order.create({
    data: {
      userId,
      addressId,
      total,
      items: {
        create: validatedItems,
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

  // Update stock
  for (const item of items) {
    await db.productVariant.update({
      where: { id: item.variantId },
      data: {
        stock: {
          decrement: item.quantity,
        },
      },
    });
  }

  // Transform to match expected response format
  return {
    id: order.id.toString(),
    items: order.items.map((item) => ({
      id: item.id.toString(),
      productId: item.variant.product.id.toString(),
      quantity: item.quantity,
      product: {
        id: item.variant.product.id,
        title: item.variant.product.title,
        description: item.variant.product.description,
        imageUrl: item.variant.product.imageUrl,
        price: item.unitPrice,
      },
      variantId: item.variantId.toString(),
    })),
    total: order.total,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
  };
};

export const getOrderById = async (orderId: number, userId: number) => {
  const order = await db.order.findFirst({
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

  if (!order) {
    return null;
  }

  // Transform to match expected response format
  return {
    id: order.id.toString(),
    items: order.items.map((item) => ({
      id: item.id.toString(),
      productId: item.variant.product.id.toString(),
      quantity: item.quantity,
      product: {
        id: item.variant.product.id,
        title: item.variant.product.title,
        description: item.variant.product.description,
        imageUrl: item.variant.product.imageUrl,
        price: item.unitPrice,
      },
      variantId: item.variantId.toString(),
    })),
    total: order.total,
    status: order.status,
    shippingAddress: order.address
      ? {
          id: order.address.id,
          label: order.address.label,
          line1: order.address.line1,
          line2: order.address.line2,
          city: order.address.city,
          postal: order.address.postal,
          country: order.address.country,
          phone: order.address.phone,
        }
      : null,
    paymentMethod: "credit_card", // Default value since payment method is not in schema
    trackingNumber: null, // Not implemented in schema yet
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.createdAt.toISOString(), // Using createdAt since updatedAt doesn't exist in schema
  };
};

export const getUserOrders = async (userId: number) => {
  const orders = await db.order.findMany({
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

  // Transform to match expected response format
  return orders.map((order) => ({
    id: order.id.toString(),
    items: order.items.map((item) => ({
      id: item.id.toString(),
      productId: item.variant.product.id.toString(),
      quantity: item.quantity,
      product: {
        id: item.variant.product.id,
        title: item.variant.product.title,
        description: item.variant.product.description,
        imageUrl: item.variant.product.imageUrl,
        price: item.unitPrice,
      },
      variantId: item.variantId.toString(),
    })),
    total: order.total,
    status: order.status,
    shippingAddress: order.address
      ? {
          id: order.address.id,
          label: order.address.label,
          line1: order.address.line1,
          line2: order.address.line2,
          city: order.address.city,
          postal: order.address.postal,
          country: order.address.country,
          phone: order.address.phone,
        }
      : null,
    paymentMethod: "credit_card", // Default value since payment method is not in schema
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.createdAt.toISOString(),
  }));
};
