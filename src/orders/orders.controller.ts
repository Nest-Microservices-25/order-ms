import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PaginationDto } from 'src/common';
import { ChangeOrderStatusDto, OrderPaginationDto } from './dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern({ cmd: 'create-order' })
  create(@Payload() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @MessagePattern({ cmd: 'get-orders' })
  findAll(@Payload() orderPaginationDto: OrderPaginationDto) {
    console.log('🚀 ~ findAll ~ paginationDto:', orderPaginationDto);
    return this.ordersService.findAll(orderPaginationDto);
  }

  @MessagePattern({ cmd: 'get-order-by-id' })
  findOne(@Payload('id', ParseUUIDPipe) id: string) {
    console.log('🚀 ~ findOne ~ id:', id);
    return this.ordersService.findOne(id);
  }
  @MessagePattern({ cmd: 'changeOrderStatus' })
  updateStatus(@Payload() updateOrderDto: UpdateOrderDto) {
    // return this.ordersService.update(updateOrderDto.id, updateOrderDto);
  }
  @MessagePattern({ cmd: 'update-status' })
  changeOrderStatus(@Payload() updateOrderDto: ChangeOrderStatusDto) {
    return this.ordersService.changeStatus(updateOrderDto);
  }
  // @MessagePattern({cmd:'removeOrder'})
  // remove(@Payload() id: number) {
  //   return this.ordersService.remove(id);
  // }
}
