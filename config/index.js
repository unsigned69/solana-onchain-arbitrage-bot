import fs from 'fs';
import Joi from 'joi';

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
  dryRun: Joi.boolean().default(false)
});

/**
 * Load and validate configuration file.
 * @param {string} [path] Path to config JSON file.
 * @returns {object} validated configuration object
 */
export function loadConfig(path = new URL('./config.json', import.meta.url).pathname) {
  const raw = fs.readFileSync(path, 'utf8');
  const json = JSON.parse(raw);
  const { value, error } = schema.validate(json);
  if (error) {
    throw new Error(`Config validation failed: ${error.message}`);
  }
  return value;
}
