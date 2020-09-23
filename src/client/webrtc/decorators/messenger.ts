import 'reflect-metadata';
import { IMessage, IMessageSubscription, IMessageSubscriptions } from '../interfaces';

import 'reflect-metadata';

export interface Subscription {
  name: string;
  propertyKey: string;
  callback: (message: IMessage) => void;
}

export interface IMessenger {
  messageSubscriptions: IMessageSubscriptions[]
  decorate: () => void;
  trigger: (this: any, name: string, message: IMessage) => void;
  on: (event: string, callback: (message) => void| any, source?: string) => void
  off: (event: string, callback: () => void | any, source: string) => void
}

const MESSENGER_DECORATORS = Symbol('MESSENGER_DECORATORS');

export const messenger = <T extends { new(...args: any[]): {} }>(
  constructor: T,
) => {
  return class Messenger extends constructor {
    messageSubscriptions: Subscription[];
    decorated: boolean = false

    decorate(this: any) {
      this.decorated = true
      // initialize the subscriptions object if none exist on the instance
      this.messageSubscriptions = {};
      const decorators: string[] =
        Reflect.getMetadata(MESSENGER_DECORATORS, this.__proto__.__proto__) || [];

      // initialize the decorators by calling them on load
      decorators.forEach((propertyKey) => {
        if (typeof this[propertyKey] === 'function') {
          this[propertyKey].call(this);
        }
      });
    }

    trigger(this: any, name: string, message: IMessage) {
      // if onTrigger is defined on the extended class use it instead
      if (typeof this.__proto__.onTrigger === 'function') {
        return this.__proto__.onTrigger.call(this, name, message);
      }
      const subscriptions: Subscription[] = this.messageSubscriptions[name] || [];
      // boot the subscriptions
      return subscriptions.map(({ propertyKey, name, callback }) => {
        return callback(message);
      });
    }


    /**
     * Subscribe to a network message or custom event
     * @param event
     * @param callback
     * @param source
     */
    public on = (event: string, callback: (message: IMessage) => void | any, source?: string) => {
      if (!this.messageSubscriptions[event]) {
        this.messageSubscriptions[event] = {};
      }
      this.messageSubscriptions[event].push({ event, callback, source } as IMessageSubscription);
    };


    /**
     * Unsubscribe from an event
     * @param event
     * @param callback
     * @param source
     */
    public off = (event: string, callback: () => void | any, source: string) => {
      this.messageSubscriptions[event] = this.messageSubscriptions[event].filter(
        obj =>
          event === obj.event
          && (callback ? obj.callback === callback : true)
          && (source ? obj.source === source : true),
      );
    };

  };
};

export function onMessage(name: string) {
  console.log('onMessage(): evaluated');
  return function(
    target,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<Function>,
  ) {
    if (!Reflect.hasMetadata(MESSENGER_DECORATORS, target)) {
      Reflect.defineMetadata(MESSENGER_DECORATORS, [], target);
    }

    const oldMetaData = Reflect.getMetadata(MESSENGER_DECORATORS, target);
    Reflect.defineMetadata(MESSENGER_DECORATORS, oldMetaData.concat(propertyKey), target);

    const method = descriptor.value;

    // on the first call onMessage the function
    descriptor.value = function(this: any) {

      if (!this.decorated) {
        throw new Error(`Messenger.decorate() must be called on decorated class`)
      }

      // onMessage the function to messageSubscriptions
      if (!this.messageSubscriptions[name]) {
        this.messageSubscriptions[name] = [];
      }
      this.messageSubscriptions[name].push({
        propertyKey,
        name,
        callback: method.bind(this),
      } as Subscription);

      // reassign the method to a trigger
      Object.defineProperty(target, propertyKey, {
        value: function(this: any, message: IMessage) {
          return this.trigger(name, message);
        },
      });
    };
  };
}

