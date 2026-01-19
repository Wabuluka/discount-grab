import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchProduct } from "@/lib/api";
import { generateProductMetadata, generateProductJsonLd, generateBreadcrumbJsonLd, type ProductSEOData } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import ProductClient from "./ProductClient";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string) {
  const product = await fetchProduct(id);
  return product;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The product you are looking for could not be found.",
    };
  }

  const seoData: ProductSEOData = {
    id: product.id || product._id || "",
    title: product.title,
    description: product.description,
    price: product.price,
    salePrice: product.salePrice ?? undefined,
    images: product.images || [],
    stock: product.stock,
    category: typeof product.category === "object" ? product.category : undefined,
    isOnSale: product.isOnSale,
  };

  return generateProductMetadata(seoData);
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const productId = product.id || product._id || "";
  const categoryInfo = typeof product.category === "object" ? product.category : null;

  const seoData: ProductSEOData = {
    id: productId,
    title: product.title,
    description: product.description,
    price: product.price,
    salePrice: product.salePrice ?? undefined,
    images: product.images || [],
    stock: product.stock,
    category: categoryInfo || undefined,
    isOnSale: product.isOnSale,
  };

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Shop", url: "/shop" },
    ...(categoryInfo
      ? [{ name: categoryInfo.name, url: `/shop?category=${categoryInfo.id || categoryInfo._id}` }]
      : []),
    { name: product.title, url: `/product/${productId}` },
  ];

  return (
    <>
      <JsonLd data={generateProductJsonLd(seoData)} />
      <JsonLd data={generateBreadcrumbJsonLd(breadcrumbItems)} />
      <ProductClient product={product} />
    </>
  );
}
