import { Logger } from '@src/utils/logger.util';
import { generateUniqueName } from '@src/utils/name.util';

export class BaseFactory {
  protected logger: Logger;

  constructor() {
    this.logger = (globalThis as any).__TEST_LOGGER__;
  }

  protected unique(prefix: string) {
    return generateUniqueName(prefix);
  }
}
