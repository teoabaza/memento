import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';
import { EntriesModule } from './entries/entries.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [PrismaModule, AuthModule, EntriesModule, StorageModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}