import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { EntriesService } from './entries.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('entries')
@UseGuards(JwtGuard)
export class EntriesController {
  constructor(private entries: EntriesService) {}

  @Get()
  getAll(@Request() req) {
    return this.entries.getEntries(req.user.sub);
  }

  @Post()
  create(@Request() req, @Body() body: { text: string; imageUrl?: string }) {
    return this.entries.createEntry(req.user.sub, body.text, body.imageUrl);
  }

  @Put(':id')
  update(@Request() req, @Param('id') id: string, @Body() body: { text: string; imageUrl?: string }) {
    return this.entries.updateEntry(id, req.user.sub, body.text, body.imageUrl);
  }

  @Delete(':id')
  delete(@Request() req, @Param('id') id: string) {
    return this.entries.deleteEntry(id, req.user.sub);
  }
}