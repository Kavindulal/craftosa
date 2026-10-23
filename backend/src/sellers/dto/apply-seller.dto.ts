
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ApplySellerDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  shopName: string;

  @IsString()
  @MinLength(20)
  @MaxLength(1000)
  bio: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  craftTypes: string[];

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  profileImageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  coverImageUrl?: string;
}
