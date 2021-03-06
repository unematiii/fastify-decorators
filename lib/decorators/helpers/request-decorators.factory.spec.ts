import type { RouteShorthandOptions } from 'fastify';
import { ErrorHandler, Hook } from '../../interfaces/controller.js';
import { CREATOR, ERROR_HANDLERS, HOOKS } from '../../symbols/index.js';
import { requestDecoratorsFactory } from './request-decorators.factory.js';

describe('Factory: request decorators', () => {
  const factory = requestDecoratorsFactory('get');

  it('should parse empty config', () => {
    class Handler {}

    const instance = { get: jest.fn() };
    const decorate = factory();

    decorate(Handler);

    // @ts-expect-error created implicitly by decorate
    Handler[CREATOR].register(instance);

    expect(instance.get).toHaveBeenCalledWith('/', <RouteShorthandOptions>{}, expect.any(Function));
  });

  it('should parse config with URL only', () => {
    class Handler {}

    const instance = { get: jest.fn() };
    const decorate = factory('/url');

    decorate(Handler);

    // @ts-expect-error created implicitly by decorate
    Handler[CREATOR].register(instance);

    expect(instance.get).toHaveBeenCalledWith('/url', <RouteShorthandOptions>{}, expect.any(Function));
  });

  it('should parse config with URL and options', () => {
    class Handler {}

    const instance = { get: jest.fn() };
    const decorate = factory('/url', <RouteShorthandOptions>{ schema: { body: { type: 'string' } } });

    decorate(Handler);

    // @ts-expect-error created implicitly by decorate
    Handler[CREATOR].register(instance);

    expect(instance.get).toHaveBeenCalledWith(
      '/url',
      <RouteShorthandOptions>{ schema: { body: { type: 'string' } } },
      expect.any(Function),
    );
  });

  it('should parse route config', () => {
    class Handler {}

    const instance = { get: jest.fn() };
    const decorate = factory({
      url: '/url',
      options: <RouteShorthandOptions>{ schema: { body: { type: 'string' } } },
    });

    decorate(Handler);

    // @ts-expect-error created implicitly by decorate
    Handler[CREATOR].register(instance);

    expect(instance.get).toHaveBeenCalledWith(
      '/url',
      <RouteShorthandOptions>{ schema: { body: { type: 'string' } } },
      expect.any(Function),
    );
  });

  describe('hooks support', () => {
    it('should create define hook in options when it does not exists', () => {
      class Handler {
        static [HOOKS]: Hook[] = [
          {
            name: 'onSend',
            handlerName: 'onSendFn',
          },
        ];
      }

      const instance = { get: jest.fn(), addHook: jest.fn() };
      const decorate = factory({
        url: '/url',
        options: <RouteShorthandOptions>{ schema: { body: { type: 'string' } } },
      });

      decorate(Handler);

      // @ts-expect-error created implicitly by decorate
      Handler[CREATOR].register(instance);

      expect(instance.get).toHaveBeenCalledWith(
        '/url',
        <RouteShorthandOptions>{
          onSend: expect.any(Function),
          schema: { body: { type: 'string' } },
        },
        expect.any(Function),
      );
    });

    it('should wrap current hook and add one more if hook exists in options', () => {
      class Handler {
        static [HOOKS]: Hook[] = [
          {
            name: 'onSend',
            handlerName: 'onSendFn',
          },
        ];
      }

      const instance = { get: jest.fn(), addHook: jest.fn() };
      const decorate = factory({
        url: '/url',
        options: <RouteShorthandOptions>{
          onSend() {
            return Promise.resolve();
          },
          schema: { body: { type: 'string' } },
        },
      });

      decorate(Handler);

      // @ts-expect-error created implicitly by decorate
      Handler[CREATOR].register(instance);

      expect(instance.get).toHaveBeenCalledWith(
        '/url',
        <RouteShorthandOptions>{
          onSend: [expect.any(Function), expect.any(Function)],
          schema: { body: { type: 'string' } },
        },
        expect.any(Function),
      );
    });

    it('should add hook to hook handlers array in options', () => {
      class Handler {
        static [HOOKS]: Hook[] = [
          {
            name: 'onSend',
            handlerName: 'onSendFn',
          },
        ];
      }

      const instance = { get: jest.fn(), addHook: jest.fn() };
      const decorate = factory({
        url: '/url',
        options: <RouteShorthandOptions>{
          onSend: [() => Promise.resolve()],
          schema: { body: { type: 'string' } },
        },
      });

      decorate(Handler);

      // @ts-expect-error created implicitly by decorate
      Handler[CREATOR].register(instance);

      expect(instance.get).toHaveBeenCalledWith(
        '/url',
        <RouteShorthandOptions>{
          onSend: [expect.any(Function), expect.any(Function)],
          schema: { body: { type: 'string' } },
        },
        expect.any(Function),
      );
    });
  });

  it('should add error handlers to options', () => {
    class Handler {
      static [ERROR_HANDLERS]: ErrorHandler[] = [
        {
          accepts: jest.fn(),
          handlerName: 'onSendFn',
        },
      ];
    }

    const instance = { get: jest.fn(), addHook: jest.fn() };
    const decorate = factory({
      url: '/url',
      options: <RouteShorthandOptions>{ schema: { body: { type: 'string' } } },
    });

    decorate(Handler);

    // @ts-expect-error created implicitly by decorate
    Handler[CREATOR].register(instance);

    expect(instance.get).toHaveBeenCalledWith(
      '/url',
      <RouteShorthandOptions>{
        errorHandler: expect.any(Function),
        schema: { body: { type: 'string' } },
      },
      expect.any(Function),
    );
  });
});
