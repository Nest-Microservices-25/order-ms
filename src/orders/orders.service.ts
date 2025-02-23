import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';

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

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const totalPages = await this.order.count();
    const lastPage = Math.ceil(totalPages / limit);
    const data = await this.order.findMany({
      skip: (page - 1) * limit,
      take: limit,
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

  // update(id: number, updateOrderDto: UpdateOrderDto) {
  //   return `This action updates a #${id} order`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} order`;
  // }
}
