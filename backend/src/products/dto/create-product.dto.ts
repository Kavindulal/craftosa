
import {
  IsInt,
  IsNumber,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100000000)
  price!: number;

  @IsString()
  @MinLength(2)
  @MaxLength(60)
  category!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1000000)
  stock!: number;

  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2048)
  imageUrl!: string;
}
