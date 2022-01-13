import {WeaponQualityRest} from "./weapon-quality-rest.model";

export interface WeaponRest {
  id: number;
  name: string;
  nameTranslation: string;
  weaponType: string;
  weaponGroupType: string;
  weaponReach: string;
  weaponRange: number;
  isUsingStrength: boolean;
  damage: number;
  weaponQualities: WeaponQualityRest[];
}
