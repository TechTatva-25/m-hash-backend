import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface s3ClientCredentials {
	region: string;
	accessKeyId: string;
	secretKey: string;
	bucketName: string;
	pptDirectory: string;
	videoDirectory: string;
	accessUrlExpiresSeconds: number;
}

interface getFileResponse {
	submissionUrl?: string;
}

function getS3ClientCredentials(): s3ClientCredentials {
	const region = process.env.S3_REGION;
	const accessKeyId = process.env.S3_ACCESS_KEY_ID;
	const secretKey = process.env.S3_SECRET_KEY;
	const bucketName = process.env.S3_BUCKET_NAME;
	const pptDirectory = process.env.S3_PPT_UPLOAD_DIR ?? "mhash_submission_ppts_02be61d23h";
	const videoDirectory = process.env.S3_VIDEO_UPLOAD_DIR ?? "mhash_submission_videos_02be61d23h";
	const accessUrlExpiresSeconds = 604800;
	// const accessUrlExpiresSeconds = process.env.S3_ACCESS_URL_EXPIRES_IN
	//  ? parseInt(process.env.S3_ACCESS_URL_EXPIRES_IN)
	//  : 900;

	if (!region || !accessKeyId || !secretKey || !bucketName) {
		throw new Error("S3 environment variables NOT set");
	}

	return {
		region,
		accessKeyId,
		secretKey,
		bucketName,
		pptDirectory,
		videoDirectory,
		accessUrlExpiresSeconds,
	};
}

const creds = getS3ClientCredentials();

const s3Client = new S3Client({
	region: creds.region,
	credentials: {
		accessKeyId: creds.accessKeyId,
		secretAccessKey: creds.secretKey,
	},
});

export const putFile = async (fileName: string, fileData: Buffer, isPpt: boolean): Promise<boolean> => {
	try {
		const response = await s3Client.send(
			new PutObjectCommand({
				Bucket: creds.bucketName,
				Key: `${isPpt ? creds.pptDirectory : creds.videoDirectory}/${fileName}`,
				Body: fileData,
			})
		);
		return response.$metadata.httpStatusCode === 200;
	} catch (error) {
		console.error(error);
		return false;
	}
};

export const getFile = async (fileName: string, isPpt: boolean): Promise<getFileResponse> => {
	try {
		const command = new GetObjectCommand({
			Bucket: creds.bucketName,
			Key: `${isPpt ? creds.pptDirectory : creds.videoDirectory}/${fileName}`,
		});
		const submissionUrl = await getSignedUrl(s3Client, command, {
			expiresIn: creds.accessUrlExpiresSeconds,
		} as object);
		return { submissionUrl };
	} catch (error) {
		console.error(error);
		return {};
	}
};

export const deleteFile = async (fileName: string, isPpt: boolean): Promise<boolean> => {
	try {
		const response = await s3Client.send(
			new DeleteObjectCommand({
				Bucket: creds.bucketName,
				Key: `${isPpt ? creds.pptDirectory : creds.videoDirectory}/${fileName}`,
			})
		);
		return response.$metadata.httpStatusCode === 204;
	} catch (error) {
		console.error(error);
		return false;
	}
};
