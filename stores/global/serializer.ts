/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { warn } from "@/utils/logger/logger";

export interface SerializableClass {
  _className: string;
  _data: Record<string, any>;
}

export class UniversalClassSerializer {
  static serialize(obj: any): any {
    if (obj === null || obj === undefined || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.serialize(item));
    }

    if (obj.constructor?.name && obj.constructor.name !== 'Object') {
      const serialized: SerializableClass = {
        _className: obj.constructor.name,
        _data: {}
      };

      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          serialized._data[key] = this.serialize(obj[key]);
        }
      }

      return serialized;
    }

    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = this.serialize(value);
    }
    return result;
  }

  static deserialize(obj: any, classRegistry?: Map<string, any>): any {
    if (obj === null || obj === undefined || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deserialize(item, classRegistry));
    }

    if (this.isSerializableClass(obj)) {
      return this.deserializeClass(obj, classRegistry);
    }

    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = this.deserialize(value, classRegistry);
    }
    return result;
  }

  private static deserializeClass(obj: SerializableClass, classRegistry?: Map<string, any>): any {
    const Constructor = this.findConstructor(obj._className, classRegistry);
    
    if (Constructor) {
      return this.createInstance(Constructor, obj._data, classRegistry);
    }
    
    return this.deserialize(obj._data, classRegistry);
  }

  private static findConstructor(className: string, classRegistry?: Map<string, any>): any {
    if (classRegistry?.has(className)) {
      return classRegistry.get(className);
    }

    if (typeof window !== 'undefined' && window[className as keyof Window]) {
      return window[className as keyof Window];
    }

    if (typeof global !== 'undefined' && (global as any)[className]) {
      return (global as any)[className];
    }

    warn("Constructor Not Found, returning null")
    return null;
  }

  private static createInstance(Constructor: any, data: Record<string, any>, classRegistry?: Map<string, any>): any {
    const instance = Object.create(Constructor.prototype);
    
    for (const [key, value] of Object.entries(data)) {
      instance[key] = this.deserialize(value, classRegistry);
    }
    
    return instance;
  }

  static isSerializableClass(obj: any): obj is SerializableClass {
    return obj && typeof obj === 'object' && obj._className && obj._data;
  }
}