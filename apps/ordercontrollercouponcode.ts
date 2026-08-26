export const verifyCouponCode = async (req: any, res: any, next: any) => {
    try {
        const { couponCode, cart } = req.body;

        if (!couponCode || !cart || cart.length === 0) {
            return next(new ValidationError("Coupon code and cart are required!"));
        }

        // Fetch the discount code
        const discount = await prisma.discount_codes.findUnique({
            where: { discountCode: couponCode },
        });

        if (!discount) {
            return next(new ValidationError("Invalid coupon code!"));
        }

        // Find the specific matching product eligible for the coupon
        const matchingProduct = cart.find(
            (item: any) => item.id === discount.productId
        );

        if (!matchingProduct) {
            return next(new ValidationError("This coupon code is not valid for items in your cart!"));
        }

        const price = matchingProduct.price * matchingProduct.quantity;
        let discountAmount = 0;

        if (discount.discountType === "Percentage") {
            discountAmount = (price * discount.discountValue) / 100;
        } else {
            discountAmount = discount.discountValue;
        }

        // Prevent discount from being greater than total price
        discountAmount = Math.min(discountAmount, price);

        res.status(200).json({
            valid: true,
            discount: discount.discountValue,
            discountAmount: discountAmount.toFixed(2),
            discountProductId: matchingProduct.id,
            discountType: discount.discountType,
            message: "Discount applied to 1 eligible product",
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
};
