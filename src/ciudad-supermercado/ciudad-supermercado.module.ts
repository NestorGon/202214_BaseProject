import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CiudadEntity } from 'src/ciudad/ciudad.entity';
import { SupermercadoEntity } from 'src/supermercado/supermercado.entity';
import { CiudadSupermercadoService } from './ciudad-supermercado.service';

@Module({
  imports: [TypeOrmModule.forFeature([CiudadEntity,SupermercadoEntity])],
  providers: [CiudadSupermercadoService]
})
export class CiudadSupermercadoModule {}
