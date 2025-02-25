import { Controller, UseInterceptors } from '@nestjs/common';
import { Body, Delete, Get, HttpCode, Param, Post, Put } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { SupermercadoDto } from 'src/supermercado/supermercado.dto';
import { SupermercadoEntity } from 'src/supermercado/supermercado.entity';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { CiudadSupermercadoService } from './ciudad-supermercado.service';

@Controller('cities')
@UseInterceptors(BusinessErrorsInterceptor)
export class CiudadSupermercadoController {
    constructor(private readonly ciudadSupermercadoService: CiudadSupermercadoService){}

    @Post(':ciudadId/supermarkets/:supermercadoId')
    async addSupermarketToCity(@Param('ciudadId') ciudadId: string, @Param('supermercadoId') supermercadoId: string) {
        return await this.ciudadSupermercadoService.addSupermarketToCity(supermercadoId, ciudadId);
    }

    @Get(':ciudadId/supermarkets')
    async findSupermarketsFromCity(@Param('ciudadId') ciudadId: string) {
        return await this.ciudadSupermercadoService.findSupermarketsFromCity(ciudadId);
    }

    @Get(':ciudadId/supermarkets/:supermercadoId')
    async findSupermarketFromCity(@Param('ciudadId') ciudadId: string, @Param('supermercadoId') supermercadoId: string) {
        return await this.ciudadSupermercadoService.findSupermarketFromCity(supermercadoId, ciudadId);
    }

    @Put(':ciudadId/supermarkets')
    async updateSupermarketsFromCity(@Body() supermercadosDto: SupermercadoDto[], @Param('ciudadId') ciudadId: string) {
        const supermercados = plainToInstance(SupermercadoEntity, supermercadosDto);
        return await this.ciudadSupermercadoService.updateSupermarketsFromCity(ciudadId,supermercados);
    }

    @Delete(':ciudadId/supermarkets/:supermercadoId')
    @HttpCode(204)
    async deleteSupermarketFromCity(@Param('ciudadId') ciudadId: string, @Param('supermercadoId') supermercadoId: string) {
        return await this.ciudadSupermercadoService.deleteSupermarketFromCity(supermercadoId, ciudadId);
    }
}
