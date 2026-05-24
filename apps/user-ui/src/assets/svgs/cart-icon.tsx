import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

const CartIcon = (props: IconProps) => (
  <svg
    width={22}
    height={22}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M3 4H5L7.2 14.4C7.3 14.9 7.7 15.2 8.2 15.2H17.4C17.9 15.2 18.3 14.9 18.4 14.4L20 7H6"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <circle
      cx="9"
      cy="19"
      r="1.5"
      stroke="currentColor"
      strokeWidth="1.5"
    />

    <circle
      cx="17"
      cy="19"
      r="1.5"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

export default CartIcon;