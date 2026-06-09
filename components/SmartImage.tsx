import Image from "next/image";

type Props = {
  url: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  blurDataUrl?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Fill the (positioned, sized) parent instead of using intrinsic dimensions. */
  fill?: boolean;
};

/**
 * Thin wrapper over next/image that tolerates a missing URL and a missing
 * blur placeholder. Works identically for Convex, R2 and external images
 * because the URL has already been resolved server-side.
 */
export function SmartImage({
  url,
  alt,
  width,
  height,
  blurDataUrl,
  sizes,
  priority,
  className,
  fill,
}: Props) {
  if (!url) {
    return <div className={`bg-faint ${className ?? ""}`} aria-hidden />;
  }
  const blur = blurDataUrl
    ? ({ placeholder: "blur" as const, blurDataURL: blurDataUrl })
    : {};

  if (fill) {
    return (
      <Image
        src={url}
        alt={alt}
        fill
        sizes={sizes ?? "(max-width: 768px) 100vw, 33vw"}
        priority={priority}
        className={className}
        {...blur}
      />
    );
  }

  return (
    <Image
      src={url}
      alt={alt}
      width={width ?? 1200}
      height={height ?? 1500}
      sizes={sizes ?? "(max-width: 768px) 100vw, 900px"}
      priority={priority}
      className={className}
      {...blur}
    />
  );
}
