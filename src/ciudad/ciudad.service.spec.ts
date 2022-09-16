import { Test, TestingModule } from '@nestjs/testing';
import { CiudadEntity } from './ciudad.entity';
import { CiudadService } from './ciudad.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { faker } from '@faker-js/faker';

describe('CiudadService', () => {
  let service: CiudadService;
  let repository: Repository<CiudadEntity>;
  let ciudadesList: CiudadEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [CiudadService],
    }).compile();

    service = module.get<CiudadService>(CiudadService);
    repository = module.get<Repository<CiudadEntity>>(getRepositoryToken(CiudadEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    ciudadesList = [];
    for (let i=0; i<5; i++) {
      const ciudad: CiudadEntity = await repository.save({
        nombre: faker.address.city(),
        pais: ["Argentina","Ecuador","Paraguay"][i%3],
        habitantes: Number(faker.random.numeric(6)),
        supermercados: []
      });
      ciudadesList.push(ciudad);
    }
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll debe retornar todas las ciudades', async () => {
    const ciudad: CiudadEntity[] = await service.findAll();
    expect(ciudad).not.toBeNull();
    expect(ciudad).toHaveLength(ciudadesList.length);
  });

  it('findOne debe retornar una ciudad por su id', async () => {
    const storedCiudad: CiudadEntity = ciudadesList[0];
    const ciudad: CiudadEntity = await service.findOne(storedCiudad.id);
    expect(ciudad).not.toBeNull();
    expect(ciudad.nombre).toEqual(storedCiudad.nombre);
    expect(ciudad.pais).toEqual(storedCiudad.pais);
    expect(ciudad.habitantes).toEqual(storedCiudad.habitantes);
  });

  it('findOne debe lanzar una excepción por una ciudad inválida', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "La ciudad con el id no fue encontrada");
  });

  it('create debe retornar una nueva ciudad', async () => {
    const ciudad: CiudadEntity = {
      id: "",
      nombre: faker.address.city(),
      pais: "Argentina",
      habitantes: Number(faker.random.numeric(6)),
      supermercados: []
    };
 
    const newCiudad: CiudadEntity = await service.create(ciudad);
    expect(newCiudad).not.toBeNull();
 
    const storedCiudad: CiudadEntity = await repository.findOne({where: {id: newCiudad.id}});
    expect(storedCiudad).not.toBeNull();
    expect(storedCiudad.nombre).toEqual(newCiudad.nombre);
    expect(storedCiudad.pais).toEqual(newCiudad.pais);
    expect(storedCiudad.habitantes).toEqual(newCiudad.habitantes);
  });

  it('create debe lanzar una excepción por una ciudad con un país inválido', async () => {
    const ciudad: CiudadEntity = {
      id: "",
      nombre: faker.address.city(),
      pais: "Colombia",
      habitantes: Number(faker.random.numeric(6)),
      supermercados: []
    };
    await expect(() => service.create(ciudad)).rejects.toHaveProperty("message", "No se puede crear una ciudad del país Colombia");
  });

  it('update debe modificar una ciudad', async () => {
    const ciudad: CiudadEntity = ciudadesList[0];
    ciudad.nombre = "New name";
    ciudad.pais = "Ecuador";
    const updatedCiudad: CiudadEntity = await service.update(ciudad.id, ciudad);
    expect(updatedCiudad).not.toBeNull();
    const storedCiudad: CiudadEntity = await repository.findOne({ where: { id: ciudad.id } });
    expect(storedCiudad).not.toBeNull();
    expect(storedCiudad.nombre).toEqual(ciudad.nombre);
    expect(storedCiudad.pais).toEqual(ciudad.pais);
  });

  it('update debe lanzar una excepción por una ciudad inválida', async () => {
    let ciudad: CiudadEntity = ciudadesList[0];
    ciudad = {
      ...ciudad, nombre: "New name", pais: "Ecuador"
    };
    await expect(() => service.update("0", ciudad)).rejects.toHaveProperty("message", "La ciudad con el id no fue encontrada");
  });

  it('update debe lanzar una excepción por una ciudad con un país inválido', async () => {
    let ciudad: CiudadEntity = ciudadesList[0];
    ciudad = {
      ...ciudad, nombre: "New name", pais: "Colombia"
    };
    await expect(() => service.update(ciudad.id, ciudad)).rejects.toHaveProperty("message", "No se puede actualizar una ciudad del país Colombia");
  });

  it('delete debe eliminar una ciudad', async () => {
    const ciudad: CiudadEntity = ciudadesList[0];
    await service.delete(ciudad.id);
    const deletedCiudad: CiudadEntity = await repository.findOne({ where: { id: ciudad.id } });
    expect(deletedCiudad).toBeNull();
  });

  it('delete debe lanzar una excepción por una ciudad inválida', async () => {
    const ciudad: CiudadEntity = ciudadesList[0];
    await service.delete(ciudad.id);
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "La ciudad con el id no fue encontrada");
  });
});
