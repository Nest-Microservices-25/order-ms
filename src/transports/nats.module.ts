import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NATS_SERVICE, envs } from 'src/config';
const MODULES = [
  ClientsModule.register([
    {
      name: NATS_SERVICE,
      transport: Transport.NATS,
      options: {
        // port: envs.port,
        servers: envs.natsServers,
      },
    },
  ]),
];
@Module({
  imports: [...MODULES],
  exports: [...MODULES],
})
export class NatsModule {}
