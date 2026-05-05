import { Search } from "lucide-react";
import Link from "next/link";

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
<div className="relative w-[50%]">
    <input type="text" placeholder="Search for products" className="h-[55px] w-full border-2 border-[#3489FF] px-4 pr-[72px] font-medium outline-none" />
    <button type="button" aria-label="Search" className="absolute right-0 top-0 flex h-[55px] w-[60px] cursor-pointer items-center justify-center bg-[#3489FF] text-white">
      <Search size={22} />
    </button>

</div>

    </div>

  </header>
  );
};

export default Header;  
