import { ChangeOrderStatusDto } from './dto/change-order-status.dto';
import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { OrderPaginationDto } from './dto';
import { NATS_SERVICE, PRODUCT_SERVICE } from 'src/config';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('OrdersService');

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
  }

  async onModuleInit() {
    this.logger.log('OrdersService has been initialized.');
    await this.$connect();
  }
  async create(createOrderDto: CreateOrderDto) {
    try {
      const { items } = createOrderDto;
      const ids = items.map((item) => item.productId);

      const products = await firstValueFrom(
        this.client.send({ cmd: 'validate-products' }, ids),
      );
      // Calcular valores
      const totalAmount = createOrderDto.items.reduce((acc, orderItem) => {
        const item = products.find(
          (product) => product.id === orderItem.productId,
        );
        return item.price * orderItem.quantity;
      }, 0);
      const totalItems = createOrderDto.items.reduce(
        (acc, orderItem) => acc + orderItem.quantity,
        0,
      );
      // Crear una transaccion de base de datos
      const order = await this.order.create({
        data: {
          totalAmount,
          totalItems,
          OrderItem: {
            createMany: {
              data: createOrderDto.items.map((item) => ({
                price: products.find((x) => x.id === item.productId).price,
                quantity: item.quantity,
                productId: item.productId,
              })),
            },
          },
        },
        include: {
          OrderItem: {
            select: {
              price: true,
              quantity: true,
              productId: true,
            },
          },
        },
      });
      return {
        ...order,
        OrderItem: order.OrderItem.map((item) => ({
          ...item,
          name: products.find((x) => x.id === item.productId).name,
        })),
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
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
      include: {
        OrderItem: {
          select: {
            price: true,
            quantity: true,
            productId: true,
          },
        },
      },
    });
    if (order) {
      const productsIds = order.OrderItem.map((item) => item.productId);
      const products = await firstValueFrom(
        this.client.send({ cmd: 'validate-products' }, productsIds),
      );

      return {
        ...order,
        OrderItem: order.OrderItem.map((item) => ({
          ...item,
          name: products.find((x) => x.id === item.productId).name,
        })),
      };
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
