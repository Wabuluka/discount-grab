require("dotenv").config();
const {
  S3Client,
  ListBucketsCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");

console.log("\n=== AWS Configuration Debug ===\n");

// 1. Check environment variables
console.log("1. Environment Variables:");
console.log(
  "   AWS_ACCESS_KEY_ID:",
  process.env.AWS_ACCESS_KEY_ID
    ? `${process.env.AWS_ACCESS_KEY_ID.substring(0, 8)}...`
    : "❌ MISSING"
);
console.log(
  "   AWS_SECRET_ACCESS_KEY:",
  process.env.AWS_SECRET_ACCESS_KEY ? "✅ EXISTS" : "❌ MISSING"
);
console.log("   AWS_REGION:", process.env.AWS_REGION || "❌ MISSING");
console.log("   AWS_BUCKET_NAME:", process.env.AWS_BUCKET_NAME || "❌ MISSING");

// 2. Create S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// 3. Test operations
async function runTests() {
  console.log("\n2. Testing AWS Operations:\n");

  // Test A: List Buckets
  console.log("Test A: Listing all buckets...");
  try {
    const listResult = await s3Client.send(new ListBucketsCommand({}));
    console.log(
      "   ✅ SUCCESS - Found",
      listResult.Buckets?.length || 0,
      "buckets"
    );
    if (listResult.Buckets) {
      listResult.Buckets.forEach((bucket) => {
        console.log("      -", bucket.Name);
      });
    }
  } catch (error) {
    console.log("   ❌ FAILED:", error.name);
    console.log("   Message:", error.message);
    return; // Stop if we can't even list buckets
  }

  // Test B: Check if specific bucket exists
  console.log("\nTest B: Checking if bucket exists...");
  try {
    const listResult = await s3Client.send(new ListBucketsCommand({}));
    const bucketExists = listResult.Buckets?.some(
      (b) => b.Name === process.env.AWS_BUCKET_NAME
    );

    if (bucketExists) {
      console.log("   ✅ Bucket exists:", process.env.AWS_BUCKET_NAME);
    } else {
      console.log("   ❌ Bucket NOT FOUND:", process.env.AWS_BUCKET_NAME);
      console.log(
        "   Available buckets:",
        listResult.Buckets?.map((b) => b.Name).join(", ")
      );
      return;
    }
  } catch (error) {
    console.log("   ❌ FAILED:", error.message);
    return;
  }

  // Test C: Upload a test file
  console.log("\nTest C: Uploading test file...");
  try {
    const uploadResult = await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `test-${Date.now()}.txt`,
        Body: "Hello from test script!",
        ContentType: "text/plain",
      })
    );

    console.log("   ✅ SUCCESS - File uploaded");
    console.log("   ETag:", uploadResult.ETag);
  } catch (error) {
    console.log("   ❌ FAILED:", error.name);
    console.log("   Message:", error.message);
    console.log("   Code:", error.$metadata?.httpStatusCode);

    if (error.name === "AccessDenied") {
      console.log("\n   ⚠️  PERMISSION ISSUE DETECTED");
      console.log("   Your IAM user can list buckets but cannot upload files.");
      console.log("   Check the IAM policy attached to your user.");
    }
  }

  console.log("\n=== Debug Complete ===\n");
}

runTests();
