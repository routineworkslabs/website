import { readFile } from 'node:fs/promises';

const domainPattern = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

try {
  const config = JSON.parse(await readFile(new URL('../site.config.json', import.meta.url), 'utf8'));
  for (const key of ['brandName', 'legalName', 'domain', 'email', 'updatedDate']) {
    if (typeof config[key] !== 'string' || !config[key].trim() || config[key] !== config[key].trim()) {
      throw new Error(`Set ${key} to a confirmed, nonempty value without surrounding whitespace in site.config.json.`);
    }
  }
  if (!domainPattern.test(config.domain)) throw new Error('domain must be a hostname without a protocol, port, or path.');
  const [local, emailDomain, extra] = config.email.split('@');
  if (extra !== undefined || !local || local.length > 64 || config.email.length > 254 || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local) || local.startsWith('.') || local.endsWith('.') || local.includes('..') || !emailDomain || !domainPattern.test(emailDomain)) {
    throw new Error('Set email to a valid public company email address.');
  }
  if (Number.isNaN(Date.parse(config.updatedDate))) throw new Error('updatedDate must be a recognizable date.');
  if (config.country != null && typeof config.country !== 'string') throw new Error('country must be a string when provided.');
  console.log('Company configuration validated.');
} catch (error) {
  console.error(`Configuration check failed: ${error.message}`);
  process.exitCode = 1;
}
