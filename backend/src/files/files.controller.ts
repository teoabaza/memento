import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { StorageService } from '../storage/storage.service';

@Controller('files')
export class FilesController {
  constructor(private storage: StorageService) {}

  @Get(':bucket/:key')
  async getFile(
    @Param('bucket') bucket: string,
    @Param('key') key: string,
    @Res() res: Response,
  ) {
    const file = await this.storage.getFile(bucket, key)
    const contentType = file.ContentType || 'application/octet-stream'
    res.setHeader('Content-Type', contentType)
    const stream = file.Body as any
    stream.pipe(res)
  }
}