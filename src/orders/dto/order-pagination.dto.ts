import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common';
import { OrderStatusList } from '../enum/order.enum';
import { OrderStatus } from '@prisma/client';

export class OrderPaginationDto extends PaginationDto {
  @IsOptional()
  @IsEnum(OrderStatusList, {
    message: `Status must be one of these: ${OrderStatusList.join(',')}`,
  })
  status: OrderStatus;
}
