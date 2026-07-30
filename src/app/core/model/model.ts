export class Model {
  public id: number | null = null;
  public name: string;
  public nameTranslation: string;
  public description: string
  public hasSpecialisation: boolean;

  constructor(name?: string, nameTranslation?: string, id?: number, description?: string, hasSpecialisation?: boolean) {
    this.id = <number>id;
    this.name = <string>name;
    this.nameTranslation = <string>nameTranslation;
    this.description = <string>description;
    this.hasSpecialisation = <boolean>hasSpecialisation;
  }

  static fromJSON(object: Object): Model {
    return Object.assign(new Model(), object);
  }

  static arrayFromJSON(objectsArray: Object[]): Model[] {
    let models = [];
    for (let object of objectsArray) {
      let model = Model.fromJSON(object);
      models.push(model);
    }
    return models;
  }
}
