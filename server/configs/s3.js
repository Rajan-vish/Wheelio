import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import imagekit from "./imageKit.js";

// Initialize S3 Client safely with environment credentials
const s3Client = (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
    ? new S3Client({
        region: process.env.AWS_REGION || "ap-south-1",
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    })
    : null;

/**
 * Uploads a file buffer to Amazon S3
 */
export const uploadToS3 = async ({ buffer, originalname, mimetype, folder = "vehicles" }) => {
    const bucket = process.env.AWS_S3_BUCKET_NAME;
    const region = process.env.AWS_REGION || "ap-south-1";

    if (!s3Client || !bucket) {
        throw new Error("AWS S3 credentials or bucket name are not configured");
    }

    const cleanName = originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `${folder}/${Date.now()}-${cleanName}`;

    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: mimetype || "image/jpeg",
    });

    await s3Client.send(command);

    // If a CloudFront distribution URL is specified, use that for edge delivery
    if (process.env.AWS_CLOUDFRONT_URL) {
        const cloudFrontBase = process.env.AWS_CLOUDFRONT_URL.replace(/\/$/, "");
        return `${cloudFrontBase}/${key}`;
    }

    // Otherwise, return direct S3 public URL
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};

/**
 * Hybrid Cloud Storage Engine:
 * Prefers Amazon S3 if configured; seamlessly falls back to ImageKit
 * Ensures zero downtime and backward-compatibility with existing setup.
 */
export const uploadCloudImage = async ({ buffer, originalname, mimetype, folder = "vehicles" }) => {
    // 1. Try AWS S3 if credentials are provided
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_S3_BUCKET_NAME) {
        try {
            console.log("Uploading vehicle asset to Amazon S3...");
            const s3Url = await uploadToS3({ buffer, originalname, mimetype, folder });
            console.log("Successfully uploaded to S3:", s3Url);
            return s3Url;
        } catch (s3Error) {
            console.error("Amazon S3 upload failed, falling back to ImageKit:", s3Error.message);
        }
    }

    // 2. Fallback to ImageKit
    console.log("Uploading vehicle asset to ImageKit...");
    const response = await imagekit.upload({
        file: buffer,
        fileName: originalname,
        folder: `/${folder}`,
    });

    const optimizedImageUrl = imagekit.url({
        path: response.filePath,
        transformation: [
            { width: "1280" },
            { quality: "auto" },
            { format: "webp" },
        ],
    });

    return optimizedImageUrl;
};

export default s3Client;
