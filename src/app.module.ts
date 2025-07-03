import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { DatabaseModule } from './db/db.module';
import { GatewayModule } from './chat/gateway/gateway.module';

@Module({
  imports: [ChatModule, DatabaseModule ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
