import type { Metadata } from "next";

const SITE_NAME = "DG - Discount Grab";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://discountgrab.com";

export interface ProductSEOData {
  id: string;
  title: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  stock: number;
  category?: { name: string; id?: string; _id?: string };
  isOnSale?: boolean;
}

export function generateProductMetadata(product: ProductSEOData): Metadata {
  const title = `${product.title} | ${SITE_NAME}`;
  const description = product.description.slice(0, 160);
  const image = product.images[0] || `${SITE_URL}/og-default.jpg`;
  const price = product.salePrice || product.price;

  return {
    title,
    description,
    keywords: [product.title, product.category?.name, "electronics", "discount", "shop"].filter(Boolean).join(", "),
    openGraph: {
      title: product.title,
      description,
      url: `${SITE_URL}/product/${product.id}`,
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: 800,
          height: 600,
          alt: product.title,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description,
      images: [image],
    },
    alternates: {
      canonical: `${SITE_URL}/product/${product.id}`,
    },
    robots: {
      index: product.stock > 0,
      follow: true,
    },
    other: {
      "product:price:amount": String(price),
      "product:price:currency": "USD",
      "product:availability": product.stock > 0 ? "in stock" : "out of stock",
    },
  };
}

export function generateProductJsonLd(product: ProductSEOData) {
  const price = product.salePrice || product.price;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product.id}`,
      priceCurrency: "USD",
      price: price.toFixed(2),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
    ...(product.category && {
      category: product.category.name,
    }),
  };
}

export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-800-555-0199",
      contactType: "customer service",
      availableLanguage: "English",
    },
  };
}

export function generateWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export const defaultMetadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: "Your favorite electronics store. Find the best deals on phones, laptops, gadgets and more.",
  keywords: ["electronics", "discount", "gadgets", "phones", "laptops", "accessories", "online shopping"],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: "Your favorite electronics store. Find the best deals on phones, laptops, gadgets and more.",
    images: [
      {
        url: `${SITE_URL}/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: "Your favorite electronics store",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};
