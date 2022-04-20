import { ConsoleLogger, Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class SilenceLogger extends ConsoleLogger implements LoggerService {
    constructor() {
        super();
        /***
         * @condition to check if it is in testing mode
         */
        if (!process.env.DISABLE_NEST_LOGGER) {
            this.setLogLevels([]);
        }
    }
}
