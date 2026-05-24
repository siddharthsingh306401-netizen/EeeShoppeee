import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

const HeartIcon = (props: IconProps) => (
  <svg
    width={20}
    height={23}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12 21C12 21 4 16 4 9.5C4 6.5 6.5 4 9.5 4C11.2 4 12.4 4.8 13 6C13.6 4.8 14.8 4 16.5 4C19.5 4 22 6.5 22 9.5C22 16 14 21 12 21Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default HeartIcon;