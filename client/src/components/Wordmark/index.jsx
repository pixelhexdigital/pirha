import { twMerge } from "tailwind-merge";

// Text logotype used across auth (and other tinted/dark) surfaces. The raster
// logo ships on an opaque white background, so it reads as a white box on any
// non-white surface — this scales cleanly and inherits its color from the
// parent (set the base color via className; ".in" always takes the brand pink).
const Wordmark = ({ className }) => (
  <span
    className={twMerge(
      "font-extrabold leading-none tracking-tight",
      className
    )}
  >
    Pirha<span className="text-primary">.in</span>
  </span>
);

export default Wordmark;
