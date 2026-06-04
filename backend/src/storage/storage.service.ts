import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class StorageService {
  private s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      region: 'garage',
      endpoint: process.env.GARAGE_ENDPOINT!,
      credentials: {
        accessKeyId: process.env.GARAGE_ACCESS_KEY!,
        secretAccessKey: process.env.GARAGE_SECRET_KEY!,
      },
      forcePathStyle: true,
    });
  }

  async getFile(bucket: string, key: string) {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key })
    return this.s3.send(command)
  }

  async uploadFile(file: any, bucket: string): Promise<string> {
    const key = `${crypto.randomUUID()}-${file.originalname}`;
    
    await this.s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));

    return `${process.env.GARAGE_PUBLIC_URL}/${bucket}/${key}`;
  }
}