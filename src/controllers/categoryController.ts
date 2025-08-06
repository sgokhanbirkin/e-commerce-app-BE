import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of all categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       parentId:
 *                         type: integer
 *                         nullable: true
 *                 message:
 *                   type: string
 */
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    res.json({
      data: categories,
      message: "Categories retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      data: null,
      message: "Failed to retrieve categories",
    });
  }
};

/**
 * @swagger
 * /api/categories/{categoryId}/products:
 *   get:
 *     summary: Get products by category ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: List of products in the category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       price:
 *                         type: number
 *                       imageUrl:
 *                         type: string
 *                       categoryId:
 *                         type: integer
 *                       category:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           parentId:
 *                             type: integer
 *                             nullable: true
 *                       variants:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             sku:
 *                               type: string
 *                             attribute:
 *                               type: string
 *                             value:
 *                               type: string
 *                             stock:
 *                               type: integer
 *                             priceDiff:
 *                               type: number
 *                       reviews:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             rating:
 *                               type: integer
 *                             comment:
 *                               type: string
 *                             createdAt:
 *                               type: string
 *                             user:
 *                               type: object
 *                               properties:
 *                                 name:
 *                                   type: string
 *                                 email:
 *                                   type: string
 *                       averageRating:
 *                         type: number
 *                       reviewCount:
 *                         type: integer
 *                 message:
 *                   type: string
 *       404:
 *         description: Category not found
 */
export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const categoryIdNum = parseInt(categoryId);

    if (isNaN(categoryIdNum)) {
      return res.status(400).json({
        data: null,
        message: "Invalid category ID",
      });
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryIdNum },
    });

    if (!category) {
      return res.status(404).json({
        data: null,
        message: "Category not found",
      });
    }

    const products = await prisma.product.findMany({
      where: {
        categoryId: categoryIdNum,
      },
      include: {
        category: true,
        variants: true,
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: {
        title: "asc",
      },
    });

    // Her ürün için averageRating ve reviewCount hesapla
    const productsWithRatings = products.map((product) => {
      const averageRating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
            product.reviews.length
          : 0;

      return {
        ...product,
        averageRating: Math.round(averageRating * 10) / 10, // 1 ondalık basamak
        reviewCount: product.reviews.length,
      };
    });

    res.json({
      data: productsWithRatings,
      message: `Products in ${category.name} category retrieved successfully`,
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({
      data: null,
      message: "Failed to retrieve products by category",
    });
  }
};
