import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CiudadEntity } from 'src/ciudad/ciudad.entity';
import { BusinessError, BusinessLogicException } from 'src/shared/errors/business-errors';
import { SupermercadoEntity } from 'src/supermercado/supermercado.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CiudadSupermercadoService {
    constructor(
        @InjectRepository(CiudadEntity)
        private readonly ciudadRepository: Repository<CiudadEntity>,
        @InjectRepository(SupermercadoEntity)
        private readonly superRepository: Repository<SupermercadoEntity>
    ) {}

    async addSupermarketToCity(superId: string, ciudadId: string): Promise<CiudadEntity> {
        const supermercado: SupermercadoEntity = await this.superRepository.findOne({where:{id:superId}});
        if (!supermercado) {
            throw new BusinessLogicException("El supermercado con el id no fue encontrado", BusinessError.NOT_FOUND);
        }
        const ciudad: CiudadEntity = await this.ciudadRepository.findOne({where:{id:ciudadId},relations:["supermercados"]});
        if (!ciudad) {
            throw new BusinessLogicException("La ciudad con el id no fue encontrada", BusinessError.NOT_FOUND);
        }
        ciudad.supermercados = [...ciudad.supermercados, supermercado];
        return await this.ciudadRepository.save(ciudad);
    }

    async findSupermarketsFromCity(ciudadId: string): Promise<SupermercadoEntity[]> {
        const ciudad: CiudadEntity = await this.ciudadRepository.findOne({where:{id:ciudadId},relations:["supermercados"]});
        if (!ciudad) {
            throw new BusinessLogicException("La ciudad con el id no fue encontrada", BusinessError.NOT_FOUND);
        }
        return ciudad.supermercados;
    }

    async findSupermarketFromCity(superId: string, ciudadId: string): Promise<SupermercadoEntity> {
        const supermercado: SupermercadoEntity = await this.superRepository.findOne({where:{id:superId}});
        if (!supermercado) {
            throw new BusinessLogicException("El supermercado con el id no fue encontrado", BusinessError.NOT_FOUND);
        }
        const ciudad: CiudadEntity = await this.ciudadRepository.findOne({where:{id:ciudadId},relations:["supermercados"]});
        if (!ciudad) {
            throw new BusinessLogicException("La ciudad con el id no fue encontrada", BusinessError.NOT_FOUND);
        }
        const supermercadoCiudad: SupermercadoEntity = ciudad.supermercados.find(s => s.id == superId);
        if (!supermercadoCiudad) {
            throw new BusinessLogicException("El supermercado con el id no está asociado a la ciudad", BusinessError.PRECONDITION_FAILED);
        }
        return supermercadoCiudad;
    }

    async updateSupermarketsFromCity(ciudadId: string, supermercados: SupermercadoEntity[]): Promise<CiudadEntity> {
        const ciudad: CiudadEntity = await this.ciudadRepository.findOne({where:{id:ciudadId},relations:["supermercados"]});
        if (!ciudad) {
            throw new BusinessLogicException("La ciudad con el id no fue encontrada", BusinessError.NOT_FOUND);
        }
        for (const sup of supermercados) {
            const supermercado: SupermercadoEntity =  await this.superRepository.findOne({where:{id:sup.id}});
            if (!supermercado) {
                throw new BusinessLogicException("El supermercado con el id no fue encontrado", BusinessError.NOT_FOUND);
            }
        }
        ciudad.supermercados = supermercados;
        return await this.ciudadRepository.save(ciudad);
    }

    async deleteSupermarketFromCity(superId: string, ciudadId: string) {
        const supermercado: SupermercadoEntity = await this.superRepository.findOne({where:{id:superId}});
        if (!supermercado) {
            throw new BusinessLogicException("El supermercado con el id no fue encontrado", BusinessError.NOT_FOUND);
        }
        const ciudad: CiudadEntity = await this.ciudadRepository.findOne({where:{id:ciudadId},relations:["supermercados"]});
        if (!ciudad) {
            throw new BusinessLogicException("La ciudad con el id no fue encontrada", BusinessError.NOT_FOUND);
        }
        const supermercadoCiudad: SupermercadoEntity = ciudad.supermercados.find(s => s.id == superId);
        if (!supermercadoCiudad) {
            throw new BusinessLogicException("El supermercado con el id no está asociado a la ciudad", BusinessError.PRECONDITION_FAILED);
        }
        ciudad.supermercados = ciudad.supermercados.filter(sup => sup.id !== superId);
        await this.ciudadRepository.save(ciudad);
    }
}
