import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { NotesService } from './notes.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('notes')
@UseGuards(JwtGuard)
export class NotesController {
  constructor(private notes: NotesService) {}

  @Get()
  getAll(@Request() req) {
    return this.notes.getNotes(req.user.sub);
  }

  @Get(':id')
  getOne(@Request() req, @Param('id') id: string) {
    return this.notes.getOne(id, req.user.sub);
  }

  @Post()
  create(@Request() req, @Body() body: { title: string; content: string }) {
    return this.notes.createNote(req.user.sub, body.title, body.content);
  }

  @Put(':id')
  update(@Request() req, @Param('id') id: string, @Body() body: { title: string; content: string }) {
    return this.notes.updateNote(id, req.user.sub, body.title, body.content);
  }

  @Delete(':id')
  delete(@Request() req, @Param('id') id: string) {
    return this.notes.deleteNote(id, req.user.sub);
  }
}
