import {Character} from "../../core/model/character/character.model";
import {Weapon} from "../../core/model/weapon/weapon.model";

export function calculateWeaponDamage(character: Character, weapon: Weapon): number {
  switch (weapon.weaponType?.name) {
    case 'MELEE':
      return calculateMeleeWeaponDamage(character, weapon.damage);
    case 'RANGED':
      return calculateRangedWeaponDamage(character, weapon);
    case 'AMMUNITION':
      return weapon.damage;
    default:
      return 0;
  }
}

function calculateMeleeWeaponDamage(character: Character, weaponDamage: number): number {
  let characterStrength = +character.strength.value.toString()[0];
  const strikeMightyBlow = character.talents.find(talent => talent.model.name === 'STRIKE_MIGHTY_BLOW');
  if (strikeMightyBlow) {
    characterStrength += +strikeMightyBlow.value;
  }
  return characterStrength + weaponDamage;
}

function calculateRangedWeaponDamage(character: Character, weapon: Weapon): number {
  let damage = 0;
  if (weapon.isUsingStrength) {
    damage += +character.strength.value.toString()[0];
  }
  const accurateShot = character.talents.find(talent => talent.model.name === 'ACCURATE_SHOT');
  if (accurateShot) {
    damage += +accurateShot.value;
  }
  return damage + weapon.damage;
}
