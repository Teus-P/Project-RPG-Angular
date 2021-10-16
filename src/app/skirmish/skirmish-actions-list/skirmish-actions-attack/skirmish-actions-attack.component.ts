import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {AttacksCategoryList} from "../../../model/attack/attack-category.model";
import {AttacksTypeList} from "../../../model/attack/attacks-type-list.model";
import {SkirmishService} from "../../skirmish-service/skirmish.service";
import {SkirmishCharacter} from "../../../model/skirmish/skirmish-character.model";
import {Weapon} from "../../../model/weapon/weapon.model";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {SaveRollDialogWindowComponent} from "../../../dialog-window/save-roll-dialog-window/save-roll-dialog-window.component";
import {BodyLocalizationList} from "../../../model/armor/body-localization.model";
import {AttackType} from 'src/app/model/attack/attack-type.model';
import {AttackReportService} from "../../../dialog-window/report-dialog-window/attack-report-service/attack-report.service";
import {AttackReportDialogWindowComponent} from "../../../dialog-window/report-dialog-window/attack-report-dialog-window.component";
import {WeaponTraitsList} from "../../../model/weapon/weaponTraits/weapon.advantages.model";

@Component({
  selector: 'app-skirmish-actions-attack',
  templateUrl: './skirmish-actions-attack.component.html',
  styleUrls: ['./skirmish-actions-attack.component.css']
})
export class SkirmishActionsAttackComponent implements OnInit {

  attackForm!: FormGroup;
  attacker!: SkirmishCharacter;
  attacksTypeList!: AttackType[];
  attacksCategoryList = AttacksCategoryList.list;
  skirmishCharactersList!: SkirmishCharacter[];
  characterWeapons!: Weapon[];
  id!: number;

  constructor(protected router: Router,
              protected route: ActivatedRoute,
              protected skirmishService: SkirmishService,
              private modalService: NgbModal,
              private attackReportService: AttackReportService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      (params: Params) => {
        this.id = +params['id'];
        this.initForm();
      }
    )
  }

  private initForm() {
    this.attacker = this.skirmishService.getSkirmishCharacter(this.id);
    this.skirmishCharactersList = this.skirmishService.getSkirmishCharacters();
    this.skirmishCharactersList.splice(this.id, 1);

    this.attacksTypeList = AttacksTypeList.attacksTypeList.filter(x => x.category.name === 'MeleeAttack');
    this.characterWeapons = this.attacker.weapons.filter(x => x.attackType.name === 'MeleeAttack');

    this.attackForm = new FormGroup({
      'attackCategory': new FormControl(AttacksCategoryList.meleeAttack, [Validators.required]),
      'attackType': new FormControl(this.attacksTypeList[0], [Validators.required]),
      'weapon': new FormControl(this.characterWeapons[0], [Validators.required]),
      'target': new FormControl(this.skirmishCharactersList[0], [Validators.required]),
      'roll': new FormControl(null, [Validators.required]),
      'modifier': new FormControl(0, [Validators.required]),
    })
  }

  onCategoryChange() {
    let category = this.attackCategory?.value.name;
    this.attacksTypeList = AttacksTypeList.attacksTypeList.filter(x => x.category.name === category);
    this.characterWeapons = this.attacker.weapons.filter(x => x.attackType.name === category);

    this.attackType?.setValue(this.attacksTypeList[0]);
    this.weapon?.setValue(this.characterWeapons[0]);
  }

  onSubmit() {
    this.attackRoll();
  }

  attackRoll() {
    this.attacker.isAttacker = true;
    this.attacker.isDodging = false;
    this.attackReportService.attackerName = this.attacker.name;

    this.attacker.usedWeapon = this.weapon?.value;
    let attackTrait = this.attacker.getFightTrait();

    if(this.attacker.usedWeapon === undefined) {
      this.attackReportService.attackerAttackTrait = 'Cecha: ' + attackTrait.base.nameTranslation;
    } else {
      this.attackReportService.attackerAttackTrait = 'Broń: ' + this.attacker.usedWeapon.nameTranslation;
    }


    this.attacker.roll = this.roll?.value;
    this.attackReportService.attackerRoll = String(this.attacker.roll);

    this.attacker.modifier = this.modifier?.value;
    this.attackReportService.attackerModifier = String(this.attacker.modifier);

    let defender = this.target?.value;
    defender.isAttacker = false;
    this.attackReportService.targetName = defender.name;

    this.createSaveRollDialog(defender).subscribe(() => {
      this.checkFightTraits(this.attacker, defender);
      let attackerSuccessLevel = this.calculateSuccessLevel(attackTrait.value, this.attacker.roll, this.attacker.modifier);
      this.attackReportService.attackerSuccessLevel = String(attackerSuccessLevel);

      let targetSuccessLevel = this.calculateSuccessLevel(defender.getFightTrait().value, defender.roll, defender.modifier);
      this.attackReportService.targetSuccessLevel = String(targetSuccessLevel);

      this.checkAttackResult(attackerSuccessLevel, targetSuccessLevel, defender);
      this.createReportDialog();
    })
  }

  createSaveRollDialog(defender: SkirmishCharacter) {
    const modalRef = this.modalService.open(SaveRollDialogWindowComponent);
    modalRef.componentInstance.target = defender;
    return modalRef.componentInstance.emitter;
  }

  createReportDialog() {
    this.modalService.open(AttackReportDialogWindowComponent);
  }

  checkFightTraits(attacker: SkirmishCharacter, defender: SkirmishCharacter) {
    this.checkWeaponTraits(attacker, defender);
    this.checkWeaponTraits(defender, attacker);
  }

  checkWeaponTraits(owner: SkirmishCharacter, opponent: SkirmishCharacter) {
    if (owner.usedWeapon !== undefined) {
      if (!owner.checkIfWeaponAdvantagesAreIgnored()) {
        WeaponTraitsList.checkFast(owner, opponent);
      }
    }
  }

  calculateSuccessLevel(skillValue: number, rollValue: number, modifier: number) {
    return (Math.floor((skillValue + modifier) / 10) - Math.floor(rollValue / 10));
  }

  checkAttackResult(attackerSuccessLevel: number, targetSuccessLevel: number, target: SkirmishCharacter) {
    if (attackerSuccessLevel > targetSuccessLevel) {
      this.attackReportService.result = 'Cel został trafiony.'
      this.calculateDamage(attackerSuccessLevel, targetSuccessLevel, target);
    } else {
      this.attackReportService.result = 'Cel wychodzi bez szwanku.'
      this.attackReportService.damage = '0';
    }
  }

  calculateDamage(attackerSuccessLevel: number, targetSuccessLevel: number, target: SkirmishCharacter) {
    let successLevelsDifference = this.calculateSuccessLevelDifference(attackerSuccessLevel, targetSuccessLevel);
    let weapon = this.weapon?.value;
    let weaponDamage = this.calculateWeaponDamage(weapon, this.attacker);
    let targetToughnessBonus = this.calculateTraitBonus(target.characteristics.toughness.value);
    let attackerRoll = this.roll?.value + this.modifier?.value;
    let armorPoints = this.getArmorPointsFromAttackLocalization(attackerRoll, this.target?.value);

    let damage = this.calculateFinalDamage(successLevelsDifference, weaponDamage, targetToughnessBonus, armorPoints);
    this.attackReportService.damage = String(damage);
    target.temporaryParameters.currentWounds -= damage;
  }

  private calculateWeaponDamage(weapon: Weapon, character: SkirmishCharacter) {
    let weaponDamage = weapon.damage;
    if (weapon.isUsingStrength) {
      weaponDamage += Math.floor(character.characteristics.strength.value / 10);
    }

    return weaponDamage;
  }

  private calculateSuccessLevelDifference(firstSuccessLevel: number, secondSuccessLevel: number) {
    return firstSuccessLevel - secondSuccessLevel;
  }

  private calculateTraitBonus(traitValue: number) {
    return Math.floor(traitValue / 10);
  }

  private getArmorPointsFromAttackLocalization(attackerRoll: number, target: SkirmishCharacter): number {
    if (attackerRoll >= 1 && attackerRoll <= 9) {
      return target.getArmorForBodyLocalization(BodyLocalizationList.head);
    } else if (attackerRoll >= 10 && attackerRoll <= 24) {
      return target.getArmorForBodyLocalization(BodyLocalizationList.arms);
    } else if (attackerRoll >= 25 && attackerRoll <= 44) {
      return target.getArmorForBodyLocalization(BodyLocalizationList.arms);
    } else if (attackerRoll >= 45 && attackerRoll <= 79) {
      return target.getArmorForBodyLocalization(BodyLocalizationList.body);
    } else if (attackerRoll >= 80 && attackerRoll <= 89) {
      return target.getArmorForBodyLocalization(BodyLocalizationList.legs);
    } else if (attackerRoll >= 90 && attackerRoll <= 100) {
      return target.getArmorForBodyLocalization(BodyLocalizationList.legs);
    } else {
      return 0;
    }
  }

  private calculateFinalDamage(successLevelsDifference: number, weaponDamage: number, targetToughnessBonus: number, armorPoints: number) {
    let damage = successLevelsDifference + weaponDamage - targetToughnessBonus - armorPoints;

    if (damage < 1) {
      damage = 1;
    }

    return damage;
  }

  get attackCategory() {
    return this.attackForm.get('attackCategory');
  }

  get attackType() {
    return this.attackForm.get('attackType');
  }

  get weapon() {
    return this.attackForm.get('weapon');
  }

  get target() {
    return this.attackForm.get('target');
  }

  get roll() {
    return this.attackForm.get('roll');
  }

  get modifier() {
    return this.attackForm.get('modifier');
  }
}
