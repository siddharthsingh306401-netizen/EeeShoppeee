import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const initializeConfig = async () => {
    const data = {
        categories: [
            "Electronics",
            "Fashion",
            "Home & Kitchen",
            "Sports & Fitness",
        ],
        subCategories: {
            "Electronics": ["Mobiles", "Laptops", "Accessories", "Gaming"],
            "Fashion": ["Men", "Women", "Kids", "Footwear"],
            "Home & Kitchen": ["Furniture", "Appliances", "Decor"],
            "Sports & Fitness": [
                "Gym Equipment",
                "Outdoor Sports",
                "Wearables",
            ]
        }
    };

    try {
        // Loop through each category and seed it into the database
        for (const categoryName of data.categories) {
            // Check if the category already exists to avoid duplication on restart
            let category = await prisma.category.findUnique({
                where: { name: categoryName }
            });

            if (!category) {
                category = await prisma.category.create({
                    data: { name: categoryName }
                });
                console.log(`Category created: ${categoryName}`);
            }

            // Get the corresponding subcategories for this category
            const subCats = data.subCategories[categoryName as keyof typeof data.subCategories] || [];

            // Loop through and seed the related subcategories
            for (const subCatName of subCats) {
                const existingSubCat = await prisma.subCategory.findFirst({
                    where: {
                        name: subCatName,
                        categoryId: category.id
                    }
                });

                if (!existingSubCat) {
                    await prisma.subCategory.create({
                        data: {
                            name: subCatName,
                            categoryId: category.id
                        }
                    });
                    console.log(`  SubCategory created: ${subCatName} under ${categoryName}`);
                }
            }
        }
        console.log("Database configuration initialization completed successfully.");
    } catch (error) {
        console.error("Error initializing site configuration data:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
};

export { initializeConfig };
