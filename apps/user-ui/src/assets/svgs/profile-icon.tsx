import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

const ProfileIcon = (props: IconProps) => (
  <svg
    width={20}
    height={23}
    viewBox="0 0 17 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle
      cx="8.5"
      cy="5.5"
      r="4.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M1 17C1 13.8 4 12 8.5 12C13 12 16 13.8 16 17"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default ProfileIcon;