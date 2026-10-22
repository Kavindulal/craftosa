import { IsIn, IsNotEmpty, IsString } from 'class-validator';
export const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
export class UpdateOrderStatusDto {
  @IsString() @IsNotEmpty() @IsIn(ORDER_STATUSES)
  status!: typeof ORDER_STATUSES[number];
}
