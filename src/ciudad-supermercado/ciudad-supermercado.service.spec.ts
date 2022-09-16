import { Test, TestingModule } from '@nestjs/testing';
import { CiudadEntity } from '../ciudad/ciudad.entity';
import { SupermercadoEntity } from '../supermercado/supermercado.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CiudadSupermercadoService } from './ciudad-supermercado.service';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';

describe('CiudadSupermercadoService', () => {
  let service: CiudadSupermercadoService;
  let ciudadRepository: Repository<CiudadEntity>;
  let superRepository: Repository<SupermercadoEntity>;
  let ciudad: CiudadEntity;
  let supermercadosList : SupermercadoEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [CiudadSupermercadoService],
    }).compile();

    service = module.get<CiudadSupermercadoService>(CiudadSupermercadoService);
    ciudadRepository = module.get<Repository<CiudadEntity>>(getRepositoryToken(CiudadEntity));
    superRepository = module.get<Repository<SupermercadoEntity>>(getRepositoryToken(SupermercadoEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    ciudadRepository.clear();
    superRepository.clear();

    supermercadosList = [];
    for (let i=0; i<5; i++) {
      const supermercado: SupermercadoEntity = await superRepository.save({
        nombre: faker.random.alpha(12),
        latitud: Number(faker.address.latitude()),
        longitud: Number(faker.address.longitude()),
        web: faker.internet.url(),
        ciudades: []
      });
      supermercadosList.push(supermercado);
    }

    ciudad = await ciudadRepository.save({
      nombre: faker.address.city(),
      pais: "Argentina",
      habitantes: Number(faker.random.numeric(6)),
      supermercados: supermercadosList
    });
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addSupermarketToCity debe agregar un supermercado a una ciudad', async () => {
    const newSupermercado: SupermercadoEntity = await superRepository.save({
      nombre: faker.random.alpha(12),
      latitud: Number(faker.address.latitude()),
      longitud: Number(faker.address.longitude()),
      web: faker.internet.url(),
      ciudades: []
    });
 
    const newCiudad: CiudadEntity = await ciudadRepository.save({
      nombre: faker.address.city(),
      pais: "Argentina",
      habitantes: Number(faker.random.numeric(6)),
      supermercados: []
    })
 
    const result: CiudadEntity = await service.addSupermarketToCity(newSupermercado.id, newCiudad.id);
   
    expect(result.supermercados.length).toBe(1);
    expect(result.supermercados[0]).not.toBeNull();
    expect(result.supermercados[0].nombre).toBe(newSupermercado.nombre);
    expect(result.supermercados[0].latitud).toBe(newSupermercado.latitud);
    expect(result.supermercados[0].longitud).toBe(newSupermercado.longitud);
    expect(result.supermercados[0].web).toBe(newSupermercado.web);
  });

  it('addSupermarketToCity debe lanzar una excepción por un supermercado inválido', async () => { 
    await expect(() => service.addSupermarketToCity("0", ciudad.id)).rejects.toHaveProperty("message", "El supermercado con el id no fue encontrado");
  });

  it('addSupermarketToCity debe lanzar una excepción por una ciudad inválida', async () => { 
    const supermercado: SupermercadoEntity = await superRepository.save({
      nombre: faker.random.alpha(12),
      latitud: Number(faker.address.latitude()),
      longitud: Number(faker.address.longitude()),
      web: faker.internet.url(),
      ciudades: []
    });
    await expect(() => service.addSupermarketToCity(supermercado.id, "0")).rejects.toHaveProperty("message", "La ciudad con el id no fue encontrada");
  });

  it('findSupermarketsFromCity debe retornar los supermercados de una ciudad', async ()=>{
    const supermercados: SupermercadoEntity[] = await service.findSupermarketsFromCity(ciudad.id);
    expect(supermercados.length).toBe(5);
  });

  it('findSupermarketsFromCity debe lanzar una excepción por una ciudad inválida', async () => {
    await expect(()=> service.findSupermarketsFromCity("0")).rejects.toHaveProperty("message", "La ciudad con el id no fue encontrada");
  });

  it('findSupermarketFromCity debe retornar el supermercado por ciudad', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    const storedSupermercado: SupermercadoEntity = await service.findSupermarketFromCity(supermercado.id, ciudad.id);
    expect(storedSupermercado).not.toBeNull();
    expect(storedSupermercado.nombre).toBe(supermercado.nombre);
    expect(storedSupermercado.latitud).toBe(supermercado.latitud);
    expect(storedSupermercado.longitud).toBe(supermercado.longitud);
    expect(storedSupermercado.web).toBe(supermercado.web);
  });

  it('findSupermarketFromCity debe lanzar una excepción por un supermercado inválido', async () => {
    await expect(()=> service.findSupermarketFromCity("0", ciudad.id)).rejects.toHaveProperty("message", "El supermercado con el id no fue encontrado");
  });

  it('findSupermarketFromCity debe lanzar una excepción por una ciudad inválida', async () => {
    await expect(()=> service.findSupermarketFromCity(supermercadosList[0].id, "0")).rejects.toHaveProperty("message", "La ciudad con el id no fue encontrada");
  });

  it('findSupermarketFromCity debe lanzar una excepción por un supermercado no asociado', async () => {
    const supermercado: SupermercadoEntity = await superRepository.save({
      nombre: faker.random.alpha(12),
      latitud: Number(faker.address.latitude()),
      longitud: Number(faker.address.longitude()),
      web: faker.internet.url(),
      ciudades: []
    });
    await expect(()=> service.findSupermarketFromCity(supermercado.id, ciudad.id)).rejects.toHaveProperty("message", "El supermercado con el id no está asociado a la ciudad");
  });

  it('updateSupermarketsFromCity debe actualizar la lista de supermercados de una ciudad', async () => {
    const newSupermercado: SupermercadoEntity = await superRepository.save({
      nombre: faker.random.alpha(12),
      latitud: Number(faker.address.latitude()),
      longitud: Number(faker.address.longitude()),
      web: faker.internet.url(),
      ciudades: []
    });
 
    const updatedCiudad: CiudadEntity = await service.updateSupermarketsFromCity(ciudad.id, [newSupermercado]);
    expect(updatedCiudad.supermercados.length).toBe(1);
    expect(updatedCiudad.supermercados[0].nombre).toBe(newSupermercado.nombre);
    expect(updatedCiudad.supermercados[0].latitud).toBe(newSupermercado.latitud);
    expect(updatedCiudad.supermercados[0].longitud).toBe(newSupermercado.longitud);
    expect(updatedCiudad.supermercados[0].web).toBe(newSupermercado.web);
  });

  it('updateSupermarketsFromCity debe lanzar una excepción por una ciudad inválida', async () => {
    const newSupermercado: SupermercadoEntity = await superRepository.save({
      nombre: faker.random.alpha(12),
      latitud: Number(faker.address.latitude()),
      longitud: Number(faker.address.longitude()),
      web: faker.internet.url(),
      ciudades: []
    });
 
    await expect(()=> service.updateSupermarketsFromCity("0", [newSupermercado])).rejects.toHaveProperty("message", "La ciudad con el id no fue encontrada");
  });

  it('updateSupermarketsFromCity debe lanzar una excepción por un supermercado inválido', async () => {
    const newSupermercado: SupermercadoEntity = supermercadosList[0];
    newSupermercado.id = "0";
 
    await expect(()=> service.updateSupermarketsFromCity(ciudad.id, [newSupermercado])).rejects.toHaveProperty("message", "El supermercado con el id no fue encontrado");
  });

  it('deleteSupermarketFromCity debe eliminar un supermercado de una ciudad', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
   
    await service.deleteSupermarketFromCity(supermercado.id, ciudad.id);
 
    const storedCiudad: CiudadEntity = await ciudadRepository.findOne({where: {id: ciudad.id}, relations: ["supermercados"]});
    const deletedSupermercado: SupermercadoEntity = storedCiudad.supermercados.find(a => a.id === supermercado.id);
 
    expect(deletedSupermercado).toBeUndefined();
  });

  it('deleteSupermarketFromCity debe lanzar una excepción por un supermercado inválido', async () => {
    await service.deleteSupermarketFromCity(supermercadosList[0].id, ciudad.id);
    await expect(()=> service.deleteSupermarketFromCity(supermercadosList[0].id, ciudad.id)).rejects.toHaveProperty("message", "El supermercado con el id no está asociado a la ciudad");
  });

  it('deleteSupermarketFromCity debe lanzar una excepción por una ciudad inválida', async () => {
    await expect(()=> service.deleteSupermarketFromCity(supermercadosList[0].id, "0")).rejects.toHaveProperty("message", "La ciudad con el id no fue encontrada");
  });

  it('deleteSupermarketFromCity debe lanzar una excepción por un supermercado no asociado', async () => {
    await expect(()=> service.deleteSupermarketFromCity(supermercadosList[0].id, "0")).rejects.toHaveProperty("message", "La ciudad con el id no fue encontrada");
  });
});
