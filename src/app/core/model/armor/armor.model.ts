import {Model} from "../model"
import {BodyLocalization} from "../body-localization/body-localization.model";

export class Armor extends Model {
  public id: number | null = null;
  public armorCategory: Model
  public armorType: Model
  public bodyLocalizations: BodyLocalization[]
  public armorPenalties: Model[]
  public armorQualities: Model[]
  public price: string
  public encumbrance: string
  public availability: Model
  public isBaseArmor: boolean
  public armorPoints: number
  public layer: number

  constructor(name?: string, nameTranslation?: string, category?: Model, type?: Model, penalties?: Model[], armorBodyLocalizations?: BodyLocalization[], qualities?: Model[], price?: string, encumbrance?: string, availability?: Model, isBaseArmor?: boolean, armorPoints?: number, layer?: number) {
    super(name, nameTranslation)
    this.armorCategory = <Model>category
    this.armorType = <Model>type
    this.armorPenalties = <Model[]>penalties
    this.bodyLocalizations = <BodyLocalization[]>armorBodyLocalizations
    this.armorQualities = <Model[]>qualities
    this.price = <string>price
    this.encumbrance = <string>encumbrance
    this.availability = <Model>availability
    this.isBaseArmor = <boolean>isBaseArmor
    this.armorPoints = <number>armorPoints
    this.layer = <number>layer
  }

  static fromJSON(object: Object): Armor {
    let armor = Object.assign(new Armor(), object)
    armor.armorCategory = Model.fromJSON(armor['armorCategory'])
    armor.armorPenalties = armor['armorPenalties'] != undefined ? Model.arrayFromJSON(armor['armorPenalties']) : []
    armor.armorQualities = armor['armorQualities'] != undefined ? Model.arrayFromJSON(armor['armorQualities']) : []
    armor.bodyLocalizations = BodyLocalization.arrayFromJSON(armor['bodyLocalizations'])
    armor.availability = Model.fromJSON(armor['availability'])
    return armor
  }

  static arrayFromJSON(objectsArray: Object[]): Armor[] {
    let armors = []
    for (let object of objectsArray) {
      let armor = Armor.fromJSON(object)
      armors.push(armor)
    }
    return armors
  }
}
