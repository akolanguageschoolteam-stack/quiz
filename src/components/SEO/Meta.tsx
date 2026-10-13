import type { Metadata } from "next";

interface MetaProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  pathName?: string;
  schema?: Record<string, unknown>;
}

const APP_WEB_URL = process.env.NEXT_PUBLIC_APP_WEB_URL;

export const getMetadata = ({
  title,
  description,
  keywords,
  ogImage,
  pathName,
}: MetaProps = {}): Metadata => {
  const metaTitle = title || process.env.NEXT_PUBLIC_META_TITLE;
  const metaDescription =
    description || process.env.NEXT_PUBLIC_META_DESCRIPTION;
  const url = pathName ? `${APP_WEB_URL}${pathName}` : APP_WEB_URL;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: keywords || process.env.NEXT_PUBLIC_KEYWORDS,
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-video-preview": -1,
        "max-image-preview": "large",
      },
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url,
      type: "website",
      images: ogImage
        ? [{ url: ogImage, width: 1080, height: 608 }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: ogImage ? [ogImage] : undefined,
    },
  };
};

// Next.js Metadata API has no field for JSON-LD, render this directly in the page.
export const JsonLd = ({ schema }: { schema: Record<string, unknown> }) => (
  <script
    key="structured-data"
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
  />
);
