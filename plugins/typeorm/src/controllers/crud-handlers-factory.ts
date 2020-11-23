/**
 * @license
 * Copyright Andrey Chalkin <L2jLiga@gmail.com> (https://github.com/L2jLiga). All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/L2jLiga/fastify-decorators/blob/master/LICENSE
 */

import { EntitySchema } from '../mappers/entity-to-json-schema';
import { Handler } from 'fastify-decorators/plugins';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ObjectLiteral } from 'typeorm';
import { modifiableProperties } from '../mappers/schema-properties';

export function crudHandlersFactory(entitySchema: EntitySchema): PropertyDescriptorMap {
    return {
        findAll: {
            async value() {
                return entitySchema.repository.find();
            },
        },
        create: {
            value(request: FastifyRequest<{ Body: ObjectLiteral }>) {
                return entitySchema.save(request.body);
            },
        },
        getOne: {
            value(request: FastifyRequest<{ Params: { id: string | number } }>) {
                return entitySchema.repository.findOneOrFail(request.params.id);
            },
        },
        updateOne: {
            async value(request: FastifyRequest<{ Params: { id: string | number }; Body: ObjectLiteral }>) {
                await entitySchema.repository.update(request.params.id, request.body);
                return entitySchema.repository.findOne(request.params.id);
            },
        },
        removeOne: {
            async value(request: FastifyRequest<{ Params: { id: string | number } }>, reply: FastifyReply) {
                await entitySchema.repository.delete(request.params.id);
                reply.status(204).send();
            },
        },
    };
}

export function crudHandlersConfiguration(entitySchema: EntitySchema): Handler[] {
    return [
        {
            url: '/',
            method: 'get',
            handlerMethod: 'findAll',
            options: {
                schema: {
                    response: {
                        200: {
                            type: 'array',
                            items: { $ref: `${entitySchema.definitionId}#/definitions/entity` },
                        },
                    },
                },
            },
        },
        {
            url: '/',
            method: 'post',
            handlerMethod: 'create',
            options: {
                schema: {
                    body: {
                        type: 'object',
                        properties: modifiableProperties(entitySchema.definitionId, entitySchema.properties),
                    },
                    response: {
                        201: { $ref: `${entitySchema.definitionId}#/definitions/entity` },
                    },
                },
            },
        },
        {
            url: '/:id',
            method: 'get',
            handlerMethod: 'getOne',
            options: {
                schema: {
                    params: {
                        type: 'object',
                        properties: {
                            id: { type: ['string', 'number'] },
                        },
                    },
                    response: {
                        200: { $ref: `${entitySchema.definitionId}#/definitions/entity` },
                    },
                },
            },
        },
        {
            url: '/:id',
            method: 'put',
            handlerMethod: 'updateOne',
            options: {
                schema: {
                    params: {
                        type: 'object',
                        properties: {
                            id: { type: ['string', 'number'] },
                        },
                    },
                    body: {
                        type: 'object',
                        properties: modifiableProperties(entitySchema.definitionId, entitySchema.properties),
                    },
                    response: {
                        200: { $ref: `${entitySchema.definitionId}#/definitions/entity` },
                    },
                },
            },
        },
        {
            url: '/:id',
            method: 'delete',
            handlerMethod: 'removeOne',
            options: {
                schema: {
                    params: {
                        type: 'object',
                        properties: {
                            id: { type: ['string', 'number'] },
                        },
                    },
                    response: {
                        200: { 'type': 'null' },
                    },
                },
            },
        },
    ];
}
