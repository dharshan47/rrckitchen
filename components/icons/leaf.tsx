import * as React from "react";

const Leaf = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width={1536}
    height={1024}
    viewBox="0 0 1536 1024"
    {...props}
  >
    <image
      xlinkHref="/icons/leaf.png"
      width={1536}
      height={1024}
    />
  </svg>
);

export default Leaf;
