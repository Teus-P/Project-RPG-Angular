import {Model} from "./model";

export class ValueModel<T extends Model> {
  public id: number;
  public model: T;
  public value: string;
  public specialisation: string;

  constructor(id?: number, model?: T, value?: string, specialisation?: string) {
    this.id = id || 0;
    this.model = model || ({} as T);
    this.value = value || '';
    this.specialisation = <string>specialisation;
  }

  static fromJSON<T extends Model>(object: any, modelClass: new () => T): ValueModel<T> {
    const instance = Object.assign(new ValueModel<T>(), object);
    if (object.model) {
      instance.model = Object.assign(new modelClass(), object.model);
    }
    return instance;
  }

  static arrayFromJSON<T extends Model>(objectsArray: any[], modelClass: new () => T): ValueModel<T>[] {
    return objectsArray.map(object => this.fromJSON(object, modelClass));
  }
}
