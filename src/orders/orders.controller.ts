import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PaginationDto } from 'src/common';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern({ cmd: 'create-order' })
  create(@Payload() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @MessagePattern({ cmd: 'get-orders' })
  findAll(@Payload() paginationDto: PaginationDto) {
    console.log('🚀 ~ findAll ~ paginationDto:', paginationDto);
    return this.ordersService.findAll(paginationDto);
  }

  @MessagePattern({ cmd: 'get-order-by-id' })
  findOne(@Payload('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }
  @MessagePattern({ cmd: 'changeOrderStatus' })
  updateStatus(@Payload() updateOrderDto: UpdateOrderDto) {
    // return this.ordersService.update(updateOrderDto.id, updateOrderDto);
  }
  // @MessagePattern({cmd:'updateOrder'})
  // update(@Payload() updateOrderDto: UpdateOrderDto) {
  //   return this.ordersService.update(updateOrderDto.id, updateOrderDto);
  // }

  // @MessagePattern({cmd:'removeOrder'})
  // remove(@Payload() id: number) {
  //   return this.ordersService.remove(id);
  // }
}
