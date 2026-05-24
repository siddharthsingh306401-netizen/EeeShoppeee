import { Search } from "lucide-react";
import Link from "next/link";
import React from "react";
import ProfileIcon from "apps/user-ui/src/assets/svgs/profile-icon";
import  HeartIcon  from "apps/user-ui/src/assets/svgs/heart-icon";
import CartIcon from "apps/user-ui/src/assets/svgs/cart-icon";

const Header = () => {
  return (
  <header className="w-full bg-white">
  <div className="mx-auto flex w-[80%] items-center justify-between gap-6 py-5">
<div>
    <Link href="/">
    <span className="text-3xl font-semibold text-red-500">
        Eshop
    </span>
    </Link>

</div>
<div className="relative w-[50%] ">
    <input type="text"
     placeholder="Search for products" 
     className="h-[55px] w-full border-2 border-[#3489FF] px-4 pr-[72px] font-medium outline-none" />
    <button type="button" aria-label="Search" className="absolute right-0 top-0 flex h-[55px] w-[60px] cursor-pointer items-center justify-center bg-[#3489FF] text-white">
      <Search color= "#fff" />
    </button>

</div>
<div className=" flex item-centre gap-8">
 <div className="flex item-centre gap-2"> 
     <link href = {"/login"} 
     className="border-2 w-[50px] h-[50px] flex item-centre justify-centre rounded-full border-[#010f1c1a]"
     >
  <ProfileIcon/>
  </link>


 <link href={"/login"}>
  <span className="block font-medium text-gray-700">Hello,</span>
  <span className="font-semibold">sign in</span>
 </link>
</div>
<div className="flex items-center gap-5"></div>
<link href = {"/wishlist"} className="relative">
<HeartIcon />
<div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-centre justify-centre absolute top-[-10px] right-[-10px]  ">
  <span className=" text-white font-medium text-sm">0</span>
</div>
</link>
<link href = {"/cart"} className="relative">
<CartIcon />
<div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-centre justify-centre absolute top-[-10px] right-[-10px]  ">
  <span className=" text-white font-medium text-sm">0</span>
</div>
</link>
</div>

  </div>
  <div className="border-b  border-b-[#99999938]">
    <HeaderBottom/>
  </div>
  </header>
  );
};

export default Header;  
