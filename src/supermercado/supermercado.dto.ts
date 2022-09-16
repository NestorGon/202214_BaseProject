import {IsNotEmpty, IsString, IsNumber, IsUrl} from 'class-validator';
export class SupermercadoDto {

    @IsString()
    @IsNotEmpty()
    readonly nombre: string;

    @IsNumber()
    @IsNotEmpty()
    readonly longitud: number;

    @IsNumber()
    @IsNotEmpty()
    readonly latitud: number;

    @IsUrl()
    @IsNotEmpty()
    readonly web: string;
}
