/**
 * AWS S3 Service
 * จัดการการอัพโหลดและดาวน์โหลดไฟล์จาก S3
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

// S3 Client Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'iot-sensor-data-bucket';

/**
 * Upload file to S3
 * @param key - File key/path in S3
 * @param body - File content
 * @param contentType - MIME type
 */
export async function uploadToS3(key: string, body: Buffer | string, contentType?: string) {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    const response = await s3Client.send(command);
    console.log(`[S3] Uploaded file: ${key}`);
    
    return {
      success: true,
      key,
      bucket: BUCKET_NAME,
      etag: response.ETag,
    };
  } catch (error) {
    console.error(`[S3 Error] Failed to upload ${key}:`, error);
    throw error;
  }
}

/**
 * Download file from S3
 * @param key - File key/path in S3
 */
export async function downloadFromS3(key: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);
    const body = await response.Body?.transformToString();
    
    console.log(`[S3] Downloaded file: ${key}`);
    return {
      success: true,
      body,
      contentType: response.ContentType,
    };
  } catch (error) {
    console.error(`[S3 Error] Failed to download ${key}:`, error);
    throw error;
  }
}

/**
 * Generate presigned URL for temporary access
 * @param key - File key/path in S3
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 */
export async function getPresignedUrl(key: string, expiresIn = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    console.log(`[S3] Generated presigned URL for: ${key}`);
    
    return {
      success: true,
      url,
      expiresIn,
    };
  } catch (error) {
    console.error(`[S3 Error] Failed to generate presigned URL for ${key}:`, error);
    throw error;
  }
}

/**
 * Delete file from S3
 * @param key - File key/path in S3
 */
export async function deleteFromS3(key: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    console.log(`[S3] Deleted file: ${key}`);
    
    return { success: true, key };
  } catch (error) {
    console.error(`[S3 Error] Failed to delete ${key}:`, error);
    throw error;
  }
}

/**
 * List files in S3 bucket
 * @param prefix - Folder prefix to filter
 * @param maxKeys - Maximum number of keys to return
 */
export async function listS3Objects(prefix?: string, maxKeys = 1000) {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: maxKeys,
    });

    const response = await s3Client.send(command);
    console.log(`[S3] Listed ${response.KeyCount} objects`);
    
    return {
      success: true,
      objects: response.Contents || [],
      count: response.KeyCount || 0,
    };
  } catch (error) {
    console.error('[S3 Error] Failed to list objects:', error);
    throw error;
  }
}

/**
 * Upload sensor data as JSON to S3
 * @param deviceId - Device identifier
 * @param data - Sensor data
 */
export async function uploadSensorData(deviceId: string, data: any) {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const key = `sensor-data/${deviceId}/${timestamp}.json`;
  
  return uploadToS3(key, JSON.stringify(data, null, 2), 'application/json');
}

/**
 * Upload device logs to S3
 * @param deviceId - Device identifier
 * @param logs - Log content
 */
export async function uploadDeviceLogs(deviceId: string, logs: string) {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const key = `device-logs/${deviceId}/${timestamp}.log`;
  
  return uploadToS3(key, logs, 'text/plain');
}

// Export S3 client for advanced usage
export { s3Client, BUCKET_NAME };
