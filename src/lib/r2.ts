// src/lib/r2.ts
import { S3Client } from "@aws-sdk/client-s3";

if (!process.env.R2_ENDPOINT) {
	throw new Error("R2_ENDPOINT is not set");
}
if (!process.env.R2_ACCESS_KEY_ID) {
	throw new Error("R2_ACCESS_KEY_ID is not set");
}
if (!process.env.R2_SECRET_ACCESS_KEY) {
	throw new Error("R2_SECRET_ACCESS_KEY is not set");
}

export const r2Client = new S3Client({
	region: "auto",
	endpoint: process.env.R2_ENDPOINT,
	credentials: {
		accessKeyId: process.env.R2_ACCESS_KEY_ID,
		secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
	},
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;