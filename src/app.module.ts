import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {SamplesModule} from "./samples/samples.module";

@Module({
  imports: [
      SamplesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
