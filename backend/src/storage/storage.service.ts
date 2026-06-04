import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      region: 'garage',
      endpoint: 'http://garage-aoy2iq5xtj2x2zoqa300cbsl:3900',
      credentials: {
        accessKeyId: process.env.GARAGE_ACCESS_KEY!,
        secretAccessKey: process.env.GARAGE_SECRET_KEY!,
      },
      forcePathStyle: true,
    });
  }

  async uploadFile(file: any, bucket: string): Promise<string> {
    const key = `${uuidv4()}-${file.originalname}`;
    
    await this.s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));

    return `https://s3.teoabaza.com/${bucket}/${key}`;
  }
}