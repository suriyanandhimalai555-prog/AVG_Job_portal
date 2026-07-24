import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

export const uploadBase64ToS3 = async (base64String) => {
    // Extract mime type and base64 data
    const matches = base64String.match(/^data:(.+);base64,(.+)$/);
    let mimeType = 'image/jpeg';
    let buffer;

    if (matches) {
        mimeType = matches[1];
        buffer = Buffer.from(matches[2], 'base64');
    } else {
        buffer = Buffer.from(base64String, 'base64');
    }

    const extension = mimeType.split('/')[1] || 'jpg';
    const fileName = `profile-pictures/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${extension}`;
    const bucketName = process.env.AWS_S3_BUCKET || 's3avg-jobportal';

    const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: buffer,
        ContentType: mimeType,
    };

    await s3Client.send(new PutObjectCommand(params));
    return `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileName}`;
};