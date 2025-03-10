import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  // DATABASE_URL: string;
  NATS_SERVERS: string[];
}

const envsSchema = joi
  .object({
    PORT: joi.number().default(3000),
    // DATABASE_URL: joi.string().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const ennVars: EnvVars = value;

export const envs = {
  port: ennVars.PORT,
  // databaseUrl: ennVars.DATABASE_URL,

  natsServers: ennVars.NATS_SERVERS,
};
