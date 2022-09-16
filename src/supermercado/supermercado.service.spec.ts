import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SupermercadoEntity } from './supermercado.entity';
import { SupermercadoService } from './supermercado.service';
import { faker } from '@faker-js/faker';

describe('SupermercadoService', () => {
  let service: SupermercadoService;
  let repository: Repository<SupermercadoEntity>;
  let supermercadosList: SupermercadoEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [SupermercadoService],
    }).compile();

    service = module.get<SupermercadoService>(SupermercadoService);
    repository = module.get<Repository<SupermercadoEntity>>(getRepositoryToken(SupermercadoEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    supermercadosList = [];
    for (let i=0; i<5; i++) {
      const supermercado: SupermercadoEntity = await repository.save({
        nombre: faker.random.alpha(12),
        latitud: Number(faker.address.latitude()),
        longitud: Number(faker.address.longitude()),
        web: faker.internet.url(),
        ciudades: []
      });
      supermercadosList.push(supermercado);
    }
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll debe retornar todos los supermercados', async () => {
    const supermercado: SupermercadoEntity[] = await service.findAll();
    expect(supermercado).not.toBeNull();
    expect(supermercado).toHaveLength(supermercadosList.length);
  });

  it('findOne debe retornar un supermercado por su id', async () => {
    const storedSupermercado: SupermercadoEntity = supermercadosList[0];
    const supermercado: SupermercadoEntity = await service.findOne(storedSupermercado.id);
    expect(supermercado).not.toBeNull();
    expect(supermercado.nombre).toEqual(storedSupermercado.nombre);
    expect(supermercado.latitud).toEqual(storedSupermercado.latitud);
    expect(supermercado.longitud).toEqual(storedSupermercado.longitud);
    expect(supermercado.web).toEqual(storedSupermercado.web);
  });

  it('findOne debe lanzar una excepción por un supermercado inválido', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "El supermercado con el id no fue encontrado");
  });

  it('create debe retornar un nuevo supermercado', async () => {
    const supermercado: SupermercadoEntity = {
      id: "",
      nombre: faker.random.alpha(12),
      latitud: Number(faker.address.latitude()),
      longitud: Number(faker.address.longitude()),
      web: faker.internet.url(),
      ciudades: []
    };
 
    const newSupermercado: SupermercadoEntity = await service.create(supermercado);
    expect(newSupermercado).not.toBeNull();
 
    const storedSupermercado: SupermercadoEntity = await repository.findOne({where: {id: newSupermercado.id}});
    expect(storedSupermercado).not.toBeNull();
    expect(storedSupermercado.nombre).toEqual(newSupermercado.nombre);
    expect(storedSupermercado.latitud).toEqual(newSupermercado.latitud);
    expect(storedSupermercado.longitud).toEqual(newSupermercado.longitud);
    expect(storedSupermercado.web).toEqual(newSupermercado.web);
  });

  it('create debe lanzar una excepción por un supermercado con un nombre inválido', async () => {
    const supermercado: SupermercadoEntity = {
      id: "",
      nombre: faker.random.alpha(8),
      latitud: Number(faker.address.latitude()),
      longitud: Number(faker.address.longitude()),
      web: faker.internet.url(),
      ciudades: []
    };
    await expect(() => service.create(supermercado)).rejects.toHaveProperty("message", "No se puede crear un supermercado con un nombre de menos de 10 caracteres");
  });

  it('update debe modificar un supermercado', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    supermercado.nombre = "New name supermarket";
    supermercado.latitud = Number(faker.address.latitude());
    const updatedsupermercado: SupermercadoEntity = await service.update(supermercado.id, supermercado);
    expect(updatedsupermercado).not.toBeNull();
    const storedSupermercado: SupermercadoEntity = await repository.findOne({ where: { id: supermercado.id } });
    expect(storedSupermercado).not.toBeNull();
    expect(storedSupermercado.nombre).toEqual(supermercado.nombre);
    expect(storedSupermercado.latitud).toEqual(supermercado.latitud);
  });

  it('update debe lanzar una excepción por un supermercado inválido', async () => {
    let supermercado: SupermercadoEntity = supermercadosList[0];
    supermercado = {
      ...supermercado, nombre: "New name supermarket", latitud: Number(faker.address.latitude())
    };
    await expect(() => service.update("0", supermercado)).rejects.toHaveProperty("message", "El supermercado con el id no fue encontrado");
  });

  it('update debe lanzar una excepción por un supermercado con un nombre inválido', async () => {
    let supermercado: SupermercadoEntity = supermercadosList[0];
    supermercado = {
      ...supermercado, nombre: "New name", latitud: Number(faker.address.latitude())
    };
    await expect(() => service.update(supermercado.id, supermercado)).rejects.toHaveProperty("message", "No se puede crear un supermercado con un nombre de menos de 10 caracteres");
  });

  it('delete debe eliminar un supermercado', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    await service.delete(supermercado.id);
    const deletedsupermercado: SupermercadoEntity = await repository.findOne({ where: { id: supermercado.id } });
    expect(deletedsupermercado).toBeNull();
  });

  it('delete debe lanzar una excepción por un supermercado inválido', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    await service.delete(supermercado.id);
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "El supermercado con el id no fue encontrado");
  });
});
