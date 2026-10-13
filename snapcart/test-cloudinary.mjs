import { v2 as cloudinary } from 'cloudinary';
import env from '@next/env';
const { loadEnvConfig } = env;

// Load .env variables just like Next.js does
loadEnvConfig(process.cwd());

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function testCloudinaryUpload() {
    console.log("Starting Cloudinary upload test...");
    console.log(`Cloud Name configured as: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    console.log(`API Key length: ${process.env.CLOUDINARY_API_KEY?.length || 'missing'}`);
    console.log(`API Secret length: ${process.env.CLOUDINARY_API_SECRET?.length || 'missing'}`);
    
    // This is a base64 encoded 1x1 pixel transparent PNG
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            "https://dummyimage.com/100x100",
            { folder: "blinkit" },
            (error, result) => {
                if (error) {
                    console.error("❌ Cloudinary Upload Failed:");
                    console.error(error);
                    reject(error);
                } else if (result) {
                    console.log("✅ Cloudinary Upload Successful!");
                    console.log("Image URL:", result.secure_url);
                    resolve(result.secure_url);
                }
            }
        );
    });
}

testCloudinaryUpload().catch(() => process.exit(1));
