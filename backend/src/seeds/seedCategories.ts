import mongoose from "mongoose";
import Category from "../models/Category";
import config from "../config/config";

interface CategoryInput {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  subcategories?: CategoryInput[];
}

const categoriesData: CategoryInput[] = [
  {
    name: "Consumer Electronics",
    slug: "consumer-electronics",
    description: "Personal electronic devices for everyday use",
    isActive: true,
    subcategories: [
      {
        name: "Audio & Sound",
        slug: "audio-sound",
        description: "Headphones, speakers, and audio equipment",
        isActive: true,
        subcategories: [
          {
            name: "Headphones & Earbuds",
            slug: "headphones-earbuds",
            description: "Wireless, wired, noise-cancelling headphones and earbuds",
            isActive: true,
          },
          {
            name: "Speakers",
            slug: "speakers",
            description: "Bluetooth speakers, smart speakers, and soundbars",
            isActive: true,
          },
          {
            name: "Microphones",
            slug: "microphones",
            description: "USB, studio, streaming, and wireless microphones",
            isActive: true,
          },
          {
            name: "Audio Interfaces & Mixers",
            slug: "audio-interfaces-mixers",
            description: "Professional audio recording and mixing equipment",
            isActive: true,
          },
          {
            name: "Turntables & Record Players",
            slug: "turntables-record-players",
            description: "Vinyl record players and accessories",
            isActive: true,
          },
        ],
      },
      {
        name: "Cameras & Photography",
        slug: "cameras-photography",
        description: "Cameras and photography equipment",
        isActive: true,
        subcategories: [
          {
            name: "DSLR Cameras",
            slug: "dslr-cameras",
            description: "Digital single-lens reflex cameras",
            isActive: true,
          },
          {
            name: "Mirrorless Cameras",
            slug: "mirrorless-cameras",
            description: "Compact system cameras without mirror mechanism",
            isActive: true,
          },
          {
            name: "Action Cameras",
            slug: "action-cameras",
            description: "Compact cameras for action and adventure recording",
            isActive: true,
          },
          {
            name: "Camera Lenses",
            slug: "camera-lenses",
            description: "Interchangeable camera lenses",
            isActive: true,
          },
          {
            name: "Tripods & Stabilizers",
            slug: "tripods-stabilizers",
            description: "Camera support and stabilization equipment",
            isActive: true,
          },
          {
            name: "Lighting Equipment",
            slug: "lighting-equipment",
            description: "Studio lights and photography lighting",
            isActive: true,
          },
        ],
      },
      {
        name: "Mobile & Tablets",
        slug: "mobile-tablets",
        description: "Smartphones, tablets, and mobile devices",
        isActive: true,
        subcategories: [
          {
            name: "Smartphones",
            slug: "smartphones",
            description: "Mobile phones and accessories",
            isActive: true,
          },
          {
            name: "Tablets",
            slug: "tablets",
            description: "iPad, Android tablets, and tablet accessories",
            isActive: true,
          },
          {
            name: "E-Readers",
            slug: "e-readers",
            description: "Kindle and other electronic reading devices",
            isActive: true,
          },
          {
            name: "Mobile Accessories",
            slug: "mobile-accessories",
            description: "Cases, screen protectors, and mobile accessories",
            isActive: true,
          },
          {
            name: "Power Banks",
            slug: "power-banks",
            description: "Portable battery chargers for mobile devices",
            isActive: true,
          },
        ],
      },
      {
        name: "Wearables",
        slug: "wearables",
        description: "Smart watches, fitness trackers, and wearable tech",
        isActive: true,
        subcategories: [
          {
            name: "Smartwatches",
            slug: "smartwatches",
            description: "Apple Watch, Samsung Galaxy Watch, and other smartwatches",
            isActive: true,
          },
          {
            name: "Fitness Trackers",
            slug: "fitness-trackers",
            description: "Activity and health monitoring devices",
            isActive: true,
          },
          {
            name: "VR/AR Headsets",
            slug: "vr-ar-headsets",
            description: "Virtual and augmented reality headsets",
            isActive: true,
          },
          {
            name: "Smart Glasses",
            slug: "smart-glasses",
            description: "Wearable glasses with smart features",
            isActive: true,
          },
        ],
      },
    ],
  },
  {
    name: "Computing",
    slug: "computing",
    description: "Computers, laptops, and computing accessories",
    isActive: true,
    subcategories: [
      {
        name: "Computers",
        slug: "computers",
        description: "Desktop and laptop computers",
        isActive: true,
        subcategories: [
          {
            name: "Desktop Computers",
            slug: "desktop-computers",
            description: "Tower and all-in-one desktop computers",
            isActive: true,
          },
          {
            name: "Laptops",
            slug: "laptops",
            description: "Portable computers and notebooks",
            isActive: true,
          },
          {
            name: "Gaming Laptops",
            slug: "gaming-laptops",
            description: "High-performance laptops for gaming",
            isActive: true,
          },
          {
            name: "Mini PCs",
            slug: "mini-pcs",
            description: "Compact desktop computers",
            isActive: true,
          },
          {
            name: "Workstations",
            slug: "workstations",
            description: "Professional high-performance computers",
            isActive: true,
          },
        ],
      },
      {
        name: "Computer Components",
        slug: "computer-components",
        description: "PC parts and components",
        isActive: true,
        subcategories: [
          {
            name: "Processors (CPUs)",
            slug: "processors-cpus",
            description: "Intel and AMD processors",
            isActive: true,
          },
          {
            name: "Graphics Cards (GPUs)",
            slug: "graphics-cards-gpus",
            description: "NVIDIA and AMD graphics cards",
            isActive: true,
          },
          {
            name: "Motherboards",
            slug: "motherboards",
            description: "PC motherboards and mainboards",
            isActive: true,
          },
          {
            name: "RAM/Memory",
            slug: "ram-memory",
            description: "Computer memory modules",
            isActive: true,
          },
          {
            name: "Storage",
            slug: "storage",
            description: "SSDs, HDDs, and NVMe drives",
            isActive: true,
          },
          {
            name: "Power Supplies",
            slug: "power-supplies",
            description: "PC power supply units",
            isActive: true,
          },
          {
            name: "PC Cases",
            slug: "pc-cases",
            description: "Computer cases and enclosures",
            isActive: true,
          },
          {
            name: "Cooling Systems",
            slug: "cooling-systems",
            description: "CPU coolers, case fans, and liquid cooling",
            isActive: true,
          },
        ],
      },
      {
        name: "Peripherals",
        slug: "peripherals",
        description: "Computer accessories and peripherals",
        isActive: true,
        subcategories: [
          {
            name: "Keyboards",
            slug: "keyboards",
            description: "Mechanical, wireless, and gaming keyboards",
            isActive: true,
          },
          {
            name: "Mice & Trackpads",
            slug: "mice-trackpads",
            description: "Computer mice and pointing devices",
            isActive: true,
          },
          {
            name: "Monitors & Displays",
            slug: "monitors-displays",
            description: "Computer monitors and screens",
            isActive: true,
          },
          {
            name: "Webcams",
            slug: "webcams",
            description: "USB and wireless webcams",
            isActive: true,
          },
          {
            name: "Drawing Tablets",
            slug: "drawing-tablets",
            description: "Graphics tablets and pen displays",
            isActive: true,
          },
          {
            name: "USB Hubs & Docking Stations",
            slug: "usb-hubs-docking-stations",
            description: "Port expansion and laptop docks",
            isActive: true,
          },
        ],
      },
      {
        name: "Networking",
        slug: "networking",
        description: "Network equipment and accessories",
        isActive: true,
        subcategories: [
          {
            name: "Routers",
            slug: "routers",
            description: "Wireless and wired routers",
            isActive: true,
          },
          {
            name: "Modems",
            slug: "modems",
            description: "Cable and DSL modems",
            isActive: true,
          },
          {
            name: "Wi-Fi Extenders & Mesh Systems",
            slug: "wifi-extenders-mesh-systems",
            description: "Network range extenders and mesh networking",
            isActive: true,
          },
          {
            name: "Network Switches",
            slug: "network-switches",
            description: "Ethernet switches and hubs",
            isActive: true,
          },
          {
            name: "Network Adapters",
            slug: "network-adapters",
            description: "USB and PCIe network adapters",
            isActive: true,
          },
        ],
      },
    ],
  },
  {
    name: "Home Electronics",
    slug: "home-electronics",
    description: "Electronics for home entertainment and automation",
    isActive: true,
    subcategories: [
      {
        name: "Television & Video",
        slug: "television-video",
        description: "TVs and video equipment",
        isActive: true,
        subcategories: [
          {
            name: "Smart TVs",
            slug: "smart-tvs",
            description: "Internet-connected televisions",
            isActive: true,
          },
          {
            name: "Streaming Devices",
            slug: "streaming-devices",
            description: "Roku, Fire TV, Chromecast, and Apple TV",
            isActive: true,
          },
          {
            name: "Projectors & Screens",
            slug: "projectors-screens",
            description: "Home theater projectors and projection screens",
            isActive: true,
          },
          {
            name: "Blu-ray & DVD Players",
            slug: "bluray-dvd-players",
            description: "Media players for physical discs",
            isActive: true,
          },
          {
            name: "TV Mounts & Stands",
            slug: "tv-mounts-stands",
            description: "Wall mounts and TV furniture",
            isActive: true,
          },
        ],
      },
      {
        name: "Smart Home",
        slug: "smart-home",
        description: "Home automation and smart devices",
        isActive: true,
        subcategories: [
          {
            name: "Smart Lighting",
            slug: "smart-lighting",
            description: "Smart bulbs, strips, and light switches",
            isActive: true,
          },
          {
            name: "Smart Thermostats",
            slug: "smart-thermostats",
            description: "Programmable and learning thermostats",
            isActive: true,
          },
          {
            name: "Smart Locks",
            slug: "smart-locks",
            description: "Keyless entry and smart door locks",
            isActive: true,
          },
          {
            name: "Smart Doorbells & Security Cameras",
            slug: "smart-doorbells-security-cameras",
            description: "Video doorbells and home security cameras",
            isActive: true,
          },
          {
            name: "Smart Plugs & Outlets",
            slug: "smart-plugs-outlets",
            description: "Wi-Fi enabled power outlets",
            isActive: true,
          },
          {
            name: "Home Automation Hubs",
            slug: "home-automation-hubs",
            description: "Central control systems for smart homes",
            isActive: true,
          },
        ],
      },
      {
        name: "Home Appliances",
        slug: "home-appliances",
        description: "Smart and electronic home appliances",
        isActive: true,
        subcategories: [
          {
            name: "Robot Vacuums",
            slug: "robot-vacuums",
            description: "Automated vacuum cleaners",
            isActive: true,
          },
          {
            name: "Air Purifiers",
            slug: "air-purifiers",
            description: "Air cleaning and filtration systems",
            isActive: true,
          },
          {
            name: "Humidifiers & Dehumidifiers",
            slug: "humidifiers-dehumidifiers",
            description: "Air moisture control devices",
            isActive: true,
          },
          {
            name: "Smart Kitchen Appliances",
            slug: "smart-kitchen-appliances",
            description: "Connected kitchen electronics",
            isActive: true,
          },
        ],
      },
    ],
  },
  {
    name: "Gaming",
    slug: "gaming",
    description: "Gaming consoles, accessories, and equipment",
    isActive: true,
    subcategories: [
      {
        name: "Gaming Consoles",
        slug: "gaming-consoles",
        description: "Video game consoles and systems",
        isActive: true,
        subcategories: [
          {
            name: "PlayStation",
            slug: "playstation",
            description: "Sony PlayStation consoles and games",
            isActive: true,
          },
          {
            name: "Xbox",
            slug: "xbox",
            description: "Microsoft Xbox consoles and games",
            isActive: true,
          },
          {
            name: "Nintendo Switch",
            slug: "nintendo-switch",
            description: "Nintendo Switch consoles and games",
            isActive: true,
          },
          {
            name: "Handheld Gaming Devices",
            slug: "handheld-gaming-devices",
            description: "Portable gaming consoles",
            isActive: true,
          },
        ],
      },
      {
        name: "Gaming Accessories",
        slug: "gaming-accessories",
        description: "Gaming peripherals and accessories",
        isActive: true,
        subcategories: [
          {
            name: "Controllers & Gamepads",
            slug: "controllers-gamepads",
            description: "Gaming controllers and accessories",
            isActive: true,
          },
          {
            name: "Gaming Headsets",
            slug: "gaming-headsets",
            description: "Headsets for gaming with microphones",
            isActive: true,
          },
          {
            name: "Gaming Keyboards & Mice",
            slug: "gaming-keyboards-mice",
            description: "RGB keyboards and gaming mice",
            isActive: true,
          },
          {
            name: "Racing Wheels & Flight Sticks",
            slug: "racing-wheels-flight-sticks",
            description: "Simulation controllers for racing and flight",
            isActive: true,
          },
          {
            name: "Gaming Chairs",
            slug: "gaming-chairs",
            description: "Ergonomic chairs for gaming",
            isActive: true,
          },
        ],
      },
      {
        name: "Gaming Components",
        slug: "gaming-components",
        description: "PC gaming hardware",
        isActive: true,
        subcategories: [
          {
            name: "Gaming Monitors",
            slug: "gaming-monitors",
            description: "High refresh rate gaming displays",
            isActive: true,
          },
          {
            name: "Capture Cards",
            slug: "capture-cards",
            description: "Game recording and streaming devices",
            isActive: true,
          },
        ],
      },
    ],
  },
  {
    name: "Professional Electronics",
    slug: "professional-electronics",
    description: "Office and business electronics",
    isActive: true,
    subcategories: [
      {
        name: "Office Equipment",
        slug: "office-equipment",
        description: "Printers, scanners, and office devices",
        isActive: true,
        subcategories: [
          {
            name: "Printers",
            slug: "printers",
            description: "Inkjet, laser, and 3D printers",
            isActive: true,
          },
          {
            name: "Scanners",
            slug: "scanners",
            description: "Document and photo scanners",
            isActive: true,
          },
          {
            name: "Copiers & Multifunction Devices",
            slug: "copiers-multifunction-devices",
            description: "All-in-one printer/scanner/copier devices",
            isActive: true,
          },
          {
            name: "Label Makers",
            slug: "label-makers",
            description: "Electronic label printing devices",
            isActive: true,
          },
          {
            name: "Shredders",
            slug: "shredders",
            description: "Paper shredding machines",
            isActive: true,
          },
        ],
      },
      {
        name: "Business Technology",
        slug: "business-technology",
        description: "Professional business equipment",
        isActive: true,
        subcategories: [
          {
            name: "Projectors & Presentation Equipment",
            slug: "projectors-presentation-equipment",
            description: "Business projectors and presentation tools",
            isActive: true,
          },
          {
            name: "Video Conferencing Systems",
            slug: "video-conferencing-systems",
            description: "Conference cameras and meeting room equipment",
            isActive: true,
          },
          {
            name: "Point of Sale (POS) Systems",
            slug: "pos-systems",
            description: "Retail checkout and payment systems",
            isActive: true,
          },
          {
            name: "Barcode Scanners",
            slug: "barcode-scanners",
            description: "Handheld and desktop barcode readers",
            isActive: true,
          },
        ],
      },
    ],
  },
  {
    name: "Power & Charging",
    slug: "power-charging",
    description: "Batteries, chargers, and power accessories",
    isActive: true,
    subcategories: [
      {
        name: "Batteries",
        slug: "batteries",
        description: "Rechargeable and disposable batteries",
        isActive: true,
      },
      {
        name: "Battery Chargers",
        slug: "battery-chargers",
        description: "Chargers for various battery types",
        isActive: true,
      },
      {
        name: "UPS Systems",
        slug: "ups-systems",
        description: "Uninterruptible power supplies",
        isActive: true,
      },
      {
        name: "Surge Protectors",
        slug: "surge-protectors",
        description: "Power surge protection devices",
        isActive: true,
      },
      {
        name: "Power Strips",
        slug: "power-strips",
        description: "Multi-outlet power extensions",
        isActive: true,
      },
      {
        name: "Wireless Chargers",
        slug: "wireless-chargers",
        description: "Qi and other wireless charging pads",
        isActive: true,
      },
    ],
  },
  {
    name: "Cables & Connectivity",
    slug: "cables-connectivity",
    description: "Cables, adapters, and connectivity accessories",
    isActive: true,
    subcategories: [
      {
        name: "USB Cables",
        slug: "usb-cables",
        description: "Type-A, Type-C, and Micro-USB cables",
        isActive: true,
      },
      {
        name: "HDMI Cables",
        slug: "hdmi-cables",
        description: "High-definition multimedia interface cables",
        isActive: true,
      },
      {
        name: "DisplayPort Cables",
        slug: "displayport-cables",
        description: "DisplayPort and Mini DisplayPort cables",
        isActive: true,
      },
      {
        name: "Audio Cables",
        slug: "audio-cables",
        description: "3.5mm, RCA, and other audio cables",
        isActive: true,
      },
      {
        name: "Adapters & Converters",
        slug: "adapters-converters",
        description: "Port adapters and signal converters",
        isActive: true,
      },
      {
        name: "Ethernet Cables",
        slug: "ethernet-cables",
        description: "Network cables and connectors",
        isActive: true,
      },
    ],
  },
];

async function insertCategory(
  category: CategoryInput,
  parentId: mongoose.Types.ObjectId | null = null
): Promise<void> {
  const { subcategories, ...categoryData } = category;

  const newCategory = await Category.create({
    ...categoryData,
    parent: parentId,
  });

  console.log(`Created category: ${newCategory.name}`);

  if (subcategories && subcategories.length > 0) {
    for (const subcategory of subcategories) {
      await insertCategory(subcategory, newCategory._id as mongoose.Types.ObjectId);
    }
  }
}

async function seedCategories(): Promise<void> {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("Connected to MongoDB");

    // Clear existing categories
    await Category.deleteMany({});
    console.log("Cleared existing categories");

    // Insert all categories
    for (const category of categoriesData) {
      await insertCategory(category);
    }

    const count = await Category.countDocuments();
    console.log(`\nSeeding completed! Total categories created: ${count}`);
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seedCategories();
