import fs from 'fs';
import Joi from 'joi';

/**
 * @typedef {Object} Config
 * @property {{rpcUrl:string,screctKey:number[],screctKeyBase58:string,guardContractIDL:string}} base
 * @property {{maxInputAmount:number,minProfit:number,maxSendRate:number,maxIOConcurrent:number,skipPreflight:boolean,mintXExpirationTime:number}} bot
 * @property {string[]} mintList
 * @property {string[]} [address_lookup_tables]
 * @property {boolean} dryRun
 * @property {{enabled:boolean,botToken:string,chatId:string,profitNotify:boolean}} [telegram]
 */

const schema = Joi.object({
  base: Joi.object({
    rpcUrl: Joi.string().uri().required(),
    screctKey: Joi.array().items(Joi.number()).optional(),
    screctKeyBase58: Joi.string().allow('').optional(),
    guardContractIDL: Joi.string().allow('').optional()
  }).required(),
  bot: Joi.object({
    maxInputAmount: Joi.number().integer().min(0).required(),
    minProfit: Joi.number().integer().min(0).required(),
    maxSendRate: Joi.number().integer().min(1).required(),
    maxIOConcurrent: Joi.number().integer().min(1).required(),
    skipPreflight: Joi.boolean().required(),
    mintXExpirationTime: Joi.number().integer().min(1).required()
  }).required(),
  mintList: Joi.array().items(Joi.string()).min(1).required(),
  address_lookup_tables: Joi.array().items(Joi.string()).optional(),
  dryRun: Joi.boolean().default(false),
  telegram: Joi.object({
    enabled: Joi.boolean().default(false),
    botToken: Joi.string().allow('').optional(),
    chatId: Joi.string().allow('').optional(),
    profitNotify: Joi.boolean().default(false)
  }).default({ enabled: false })
});

/**
 * Load and validate configuration file.
 * @param {string} [path] Path to config JSON file.
 * @returns {Config} validated configuration object
 */
export function loadConfig(path = new URL('./config.json', import.meta.url).pathname) {
  const raw = fs.readFileSync(path, 'utf8');
  const json = JSON.parse(raw);
  const { value, error } = schema.validate(json);
  if (error) {
    throw new Error(`Config validation failed: ${error.message}`);
  }
  if (process.env.DRY_RUN !== undefined) {
    value.dryRun = process.env.DRY_RUN === 'true';
  }
  return value;
}
