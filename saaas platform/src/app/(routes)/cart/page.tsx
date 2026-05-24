



import {useStore} from "apps/user-ui-/src/store";
import(Loader2} from "lucide-react");
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const CartPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceInfo();
  const cart = useStore((state: any) => state.cart);
  const [discountedProductId, setDiscountedProductId] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");

  const removeFromCart = useStore((state: any) => state.removeFromCart);
  const [loading, setLoading] = useState(false);

  const increaseQuantity = (id: string) => {
  useStore.setState((state: any) => ({
    cart: state.cart.map((item: any) => 
      item.id === id ? { ...item, quantity: (item.quantity ?? 0) + 1 } : item
    ),
  }));
};





















  const subtotal = cart.reduce(
    (total: number, item: any) => total + item.quantity * item.sale_price,
    0
  );

  return (
    <div className="w-full bg-white">
      <div className="md:w-[80%] w-[95%] mx-auto min-h-screen">
        <div className="ph-[50px]">
          <h1 className="md:pt-[50px] font-medium text-[44px] leading-[1] mb-[16px] fort-bold">
            Shopping Cart
          </h1>        
          <Link href={"/"} className="text-[#55585b] hover:underline">
            Home
          </Link>         
          <span className="inline-block p-[1.5px] mx-1 bg-[#a8acb0] rounded-full"></span>
          
       
        </div>
      </div>
    </div>
  );
};