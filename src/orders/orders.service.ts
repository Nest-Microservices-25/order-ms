import { ChangeOrderStatusDto } from './dto/change-order-status.dto';
import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';
import { OrderPaginationDto } from './dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('OrdersService');
  async onModuleInit() {
    this.logger.log('OrdersService has been initialized.');
    await this.$connect();
  }
  create(createOrderDto: CreateOrderDto) {
    return this.order.create({
      data: createOrderDto,
    });
  }

  async findAll(paginationDto: OrderPaginationDto) {
    const { page, limit } = paginationDto;
    const totalPages = await this.order.count({
      where: {
        status: paginationDto.status,
      },
    });
    const lastPage = Math.ceil(totalPages / limit);
    const data = await this.order.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        status: paginationDto.status,
      },
    });
    return {
      data,
      meta: {
        total: totalPages,
        page: page,
        lastPage: lastPage,
      },
    };
  }

  async findOne(id: string) {
    const order = await this.order.findFirst({
      where: {
        id,
      },
    });
    if (order) {
      return order;
    } else {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `Product with ID ${id} not found`,
      });
      // throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  async changeStatus(changeOrderStatusDto: ChangeOrderStatusDto) {
    const { id, status } = changeOrderStatusDto;
    const order = await this.findOne(id);
    return this.order.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }

  // remove(id: number) {
  //   return `This action removes a #${id} order`;
  // }
}
