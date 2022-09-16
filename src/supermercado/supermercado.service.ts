import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { Repository } from 'typeorm';
import { SupermercadoEntity } from './supermercado.entity';

@Injectable()
export class SupermercadoService {
    constructor(
        @InjectRepository(SupermercadoEntity)
        private readonly superRepository: Repository<SupermercadoEntity>
    ){}

    async findAll(): Promise<SupermercadoEntity[]> {
        return await this.superRepository.find({relations: ["ciudades"]});
    }

    async findOne(id: string): Promise<SupermercadoEntity> {
        const supermercado: SupermercadoEntity = await this.superRepository.findOne({where:{id},relations:["ciudades"]})
        if (!supermercado) {
            throw new BusinessLogicException("El supermercado con el id no fue encontrado", BusinessError.NOT_FOUND);
        }
        return supermercado;
    }

    async create(supermercado: SupermercadoEntity): Promise<SupermercadoEntity> {
        if (supermercado.nombre.length <= 10) {
            throw new BusinessLogicException("No se puede crear un supermercado con un nombre de menos de 10 caracteres", BusinessError.BAD_REQUEST);
        }
        return await this.superRepository.save(supermercado);
    }

    async update(id: string, supermercado: SupermercadoEntity): Promise<SupermercadoEntity> {
        const persistedSupermercado: SupermercadoEntity = await this.superRepository.findOne({where:{id}});
        if (!persistedSupermercado) {
            throw new BusinessLogicException("El supermercado con el id no fue encontrado", BusinessError.NOT_FOUND);
        }
        if (supermercado.nombre.length <= 10) {
            throw new BusinessLogicException("No se puede crear un supermercado con un nombre de menos de 10 caracteres", BusinessError.BAD_REQUEST);
        }
        supermercado.id = id;
        return await this.superRepository.save(supermercado);
    }

    async delete(id: string) {
        const supermercado: SupermercadoEntity = await this.superRepository.findOne({where:{id}});
        if (!supermercado) {
            throw new BusinessLogicException("El supermercado con el id no fue encontrado", BusinessError.NOT_FOUND)
        }
        await this.superRepository.remove(supermercado);
    }
}
