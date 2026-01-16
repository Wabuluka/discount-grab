import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product";

dotenv.config();

// Replacement images from Unsplash (free to use)
const replacementImages: Record<string, string[]> = {
  headphones: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80",
  ],
  controller: [
    "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=800&q=80",
    "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=800&q=80",
  ],
  "smart-home": [
    "https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800&q=80",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
  ],
  phone: [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
    "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80",
  ],
  laptop: [
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80",
  ],
  camera: [
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
    "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80",
  ],
  watch: [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80",
  ],
  tablet: [
    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80",
    "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=80",
  ],
  speaker: [
    "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80",
    "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80",
  ],
  default: [
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80",
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
  ],
};

// Get replacement images based on product title
function getReplacementImages(title: string): string[] {
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes("headphone") || lowerTitle.includes("earphone") || lowerTitle.includes("airpod")) {
    return replacementImages.headphones;
  }
  if (lowerTitle.includes("controller") || lowerTitle.includes("gamepad") || lowerTitle.includes("joystick")) {
    return replacementImages.controller;
  }
  if (lowerTitle.includes("smart home") || lowerTitle.includes("smart-home") || lowerTitle.includes("home automation")) {
    return replacementImages["smart-home"];
  }
  if (lowerTitle.includes("phone") || lowerTitle.includes("iphone") || lowerTitle.includes("samsung") || lowerTitle.includes("mobile")) {
    return replacementImages.phone;
  }
  if (lowerTitle.includes("laptop") || lowerTitle.includes("macbook") || lowerTitle.includes("notebook")) {
    return replacementImages.laptop;
  }
  if (lowerTitle.includes("camera") || lowerTitle.includes("dslr") || lowerTitle.includes("gopro")) {
    return replacementImages.camera;
  }
  if (lowerTitle.includes("watch") || lowerTitle.includes("smartwatch") || lowerTitle.includes("fitbit")) {
    return replacementImages.watch;
  }
  if (lowerTitle.includes("tablet") || lowerTitle.includes("ipad")) {
    return replacementImages.tablet;
  }
  if (lowerTitle.includes("speaker") || lowerTitle.includes("soundbar") || lowerTitle.includes("audio")) {
    return replacementImages.speaker;
  }

  return replacementImages.default;
}

async function fixProductImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to MongoDB");

    // Find all products with pngtree images
    const products = await Product.find({
      images: { $regex: /pngtree\.com/i }
    });

    console.log(`Found ${products.length} products with pngtree images`);

    for (const product of products) {
      const newImages = getReplacementImages(product.title);

      // Replace pngtree images with new ones
      const updatedImages = product.images.map((img: string) => {
        if (img.includes("pngtree.com")) {
          return newImages[0]; // Use first replacement image
        }
        return img;
      });

      // Remove duplicates
      const uniqueImages = [...new Set(updatedImages)];

      // If we only have one image, add a second one
      if (uniqueImages.length < 2 && newImages.length > 1) {
        uniqueImages.push(newImages[1]);
      }

      product.images = uniqueImages;
      await product.save();

      console.log(`Updated: ${product.title}`);
    }

    console.log("Done fixing product images!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixProductImages();
