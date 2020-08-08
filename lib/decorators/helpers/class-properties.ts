/**
 * @license
 * Copyright Andrey Chalkin <L2jLiga@gmail.com> (https://github.com/L2jLiga). All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/L2jLiga/fastify-decorators/blob/master/LICENSE
 */

import { ErrorHandler } from '../../interfaces';
import { ERROR_HANDLERS } from '../../symbols';

export function ensureErrorHandlers(val: any): asserts val is { [ERROR_HANDLERS]: ErrorHandler[] } {
    if (!(ERROR_HANDLERS in val)) {
        val[ERROR_HANDLERS] = [];
    }
}

export function hasErrorHandlers(val: any): val is { [ERROR_HANDLERS]: ErrorHandler[] } {
    return ERROR_HANDLERS in val;
}