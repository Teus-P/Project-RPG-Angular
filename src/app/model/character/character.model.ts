import {CharacterTalent} from "../talent/character-talent.model"
import {Armor} from "../armor/armor.model"
import {CharacterCharacteristic} from "../characteristic/character-characteristic.model"
import {CharacterSkill} from "../skill/character-skill.model"
import {CharacterWeapon} from "../weapon/character-weapon.model"
import {CharacterBodyLocalization} from "../body-localization/character-body-localization.model"
import {CharacterCondition} from "../condition/character-condition.model"
import {CharacterTrait} from "../trait/character-trait.model"
import {Spell} from "../spell/spell.model"
import {Note} from "../note/note.model";

export class Character {
  id!: number
  name!: string
  description!: string
  group!: string
  status!: string
  characteristics!: CharacterCharacteristic[]
  skills!: CharacterSkill[]
  talents!: CharacterTalent[]
  traits!: CharacterTrait[]
  isRightHanded!: boolean
  weapons!: CharacterWeapon[]
  armors!: Armor[]
  bodyLocalizations!: CharacterBodyLocalization[]
  conditions!: CharacterCondition[]
  notes!: Note[]
  spells!: Spell[]
  type!: string

  constructor(name?: string, description?: string, group?: string, status?: string, characteristics?: CharacterCharacteristic[], skills?: CharacterSkill[], talents?: CharacterTalent[], traits?: CharacterTrait[], rightHanded?: boolean, weapons?: CharacterWeapon[], armor?: Armor[], conditions?: CharacterCondition[], notes?: Note[], spells?: Spell[], bodyLocalizations?: CharacterBodyLocalization[]) {
    this.name = <string>name
    this.description = <string>description
    this.group = <string>group
    this.characteristics = <CharacterCharacteristic[]>characteristics
    this.skills = <CharacterSkill[]>skills
    this.talents = <CharacterTalent[]>talents
    this.traits = <CharacterTrait[]>traits
    this.isRightHanded = <boolean>rightHanded
    this.weapons = <CharacterWeapon[]>weapons
    this.armors = <Armor[]>armor
    this.bodyLocalizations = <CharacterBodyLocalization[]>bodyLocalizations
    this.conditions = <CharacterCondition[]>conditions
    this.notes = <Note[]>notes
    this.spells = <Spell[]>spells
    this.status = <string>status
  }

  clearIds() {
    this.characteristics.forEach(value => value.id = 0)
    this.bodyLocalizations.forEach(value => value.id = 0)
    this.skills.forEach(value => value.id = 0)
    this.talents.forEach(value => value.id = 0)
    this.traits.forEach(value => value.id = 0)
    this.weapons.forEach(value => value.id = 0)
    this.conditions.forEach(value => value.id = 0)
    this.notes.forEach(value => value.id = 0)
  }

  getCharacteristic(name: string): CharacterCharacteristic {
    return <CharacterCharacteristic>this.characteristics.find(x => x.characteristic.name == name)
  }

  get movement(): CharacterCharacteristic {
    return <CharacterCharacteristic>this.characteristics.find(x => x.characteristic.name == 'MOVEMENT')
  }

  get weaponSkill(): CharacterCharacteristic {
    return <CharacterCharacteristic>this.characteristics.find(x => x.characteristic.name == 'WEAPON_SKILL')
  }

  get ballisticSkill(): CharacterCharacteristic {
    return <CharacterCharacteristic>this.characteristics.find(x => x.characteristic.name == 'BALLISTIC_SKILL')
  }

  get strength(): CharacterCharacteristic {
    return <CharacterCharacteristic>this.characteristics.find(x => x.characteristic.name == 'STRENGTH')
  }

  get toughness(): CharacterCharacteristic {
    return <CharacterCharacteristic>this.characteristics.find(x => x.characteristic.name == 'TOUGHNESS')
  }

  get initiative(): CharacterCharacteristic {
    return <CharacterCharacteristic>this.characteristics.find(x => x.characteristic.name == 'INITIATIVE')
  }

  get agility(): CharacterCharacteristic {
    return <CharacterCharacteristic>this.characteristics.find(x => x.characteristic.name == 'AGILITY')
  }

  get dexterity(): CharacterCharacteristic {
    return <CharacterCharacteristic>this.characteristics.find(x => x.characteristic.name == 'DEXTERITY')
  }

  get intelligence(): CharacterCharacteristic {
    return <CharacterCharacteristic>this.characteristics.find(x => x.characteristic.name == 'INTELLIGENCE')
  }

  get willpower(): CharacterCharacteristic {
    return <CharacterCharacteristic>this.characteristics.find(x => x.characteristic.name == 'WILLPOWER')
  }

  get fellowship(): CharacterCharacteristic {
    return <CharacterCharacteristic>this.characteristics.find(x => x.characteristic.name == 'FELLOWSHIP')
  }

  get wounds(): CharacterCharacteristic {
    return <CharacterCharacteristic>this.characteristics.find(x => x.characteristic.name == 'WOUNDS')
  }

  static fromJSON(object: Object): Character {
    let character = Object.assign(new Character(), object)
    character.characteristics = CharacterCharacteristic.arrayFromJSON(character['characteristics'])
    character.skills = CharacterSkill.arrayFromJSON(character["skills"])
    character.talents = CharacterTalent.arrayFromJSON(character["talents"])
    character.traits = CharacterTrait.arrayFromJSON(character["traits"])
    character.weapons = CharacterWeapon.arrayFromJSON(character['weapons'])
    character.armors = Armor.arrayFromJSON(character['armors'])
    character.bodyLocalizations = CharacterBodyLocalization.arrayFromJSON(character['bodyLocalizations'])
    character.conditions = CharacterCondition.arrayFromJSON(character['conditions'])
    character.spells = Spell.arrayFromJSON(character['spells'])
    character.notes = Note.arrayFromJSON(character['notes'])
    return character
  }

  static arrayFromJSON(objectsArray: Object[]): Character[] {
    let characters = []
    for (let object of objectsArray) {
      let character = Character.fromJSON(object)
      characters.push(character)
    }
    return characters
  }
}
