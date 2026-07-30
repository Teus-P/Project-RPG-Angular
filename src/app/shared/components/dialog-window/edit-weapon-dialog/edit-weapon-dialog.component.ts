import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Weapon} from "../../../../core/model/weapon/weapon.model";
import {FormBuilder, UntypedFormArray, UntypedFormGroup, Validators} from "@angular/forms";
import {Model} from "../../../../core/model/model";
import {WeaponService} from "../../../../core/services/weapon-service/weapon.service";
import {TextResourceService} from "../../../../core/services/text-resource-service/text-resource.service";
import {WeaponQualityValue} from "../../../../core/model/weapon/weapon-quality-value.model";
import {AvailabilityService} from "../../../../core/services/availability-service/availability.service";

@Component({
    selector: 'app-edit-weapon-dialog',
    templateUrl: './edit-weapon-dialog.component.html',
    styleUrls: ['./edit-weapon-dialog.component.css'],
    standalone: false
})
export class EditWeaponDialog implements OnInit {

  form!: UntypedFormGroup;
  modifiedWeapon = new Weapon();
  text = TextResourceService;

  constructor(public dialogRef: MatDialogRef<EditWeaponDialog>,
              @Inject(MAT_DIALOG_DATA) public weapon: Weapon,
              public weaponService: WeaponService,
              public availabilityService: AvailabilityService,
              private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm() {
    Object.assign(this.modifiedWeapon, this.weapon);
    this.form = this.formBuilder.group({
      'name': [this.modifiedWeapon.name ?? null, Validators.required],
      'nameTranslation': [this.modifiedWeapon.nameTranslation ?? null, Validators.required],
      'weaponType': [this.modifiedWeapon.weaponType ?? this.weaponService.weaponTypesList[0]],
      'weaponGroup': [this.modifiedWeapon.weaponGroup ?? this.weaponService.weaponGroupsList[0]],
      'weaponReach': [this.modifiedWeapon.weaponReach ?? this.weaponService.weaponReachesList[0]],
      'weaponRange': [this.modifiedWeapon.weaponRange ?? 0, Validators.required],
      'isUsingStrength': [this.modifiedWeapon.isUsingStrength ?? null],
      'isUsingStrengthInRange': [this.modifiedWeapon.isUsingStrengthInRange ?? null],
      'damage': [this.modifiedWeapon.damage ?? null, Validators.required],
      'weaponQualities': this.prepareWeaponQualitiesList(this.weapon.weaponQualities ?? []),
      'price': [this.modifiedWeapon.price ?? null],
      'encumbrance': [this.modifiedWeapon.encumbrance ?? null],
      'availability': [this.modifiedWeapon.availability ?? this.availabilityService.availabilityList[0]],
    });
  }

  prepareWeaponQualitiesList(weaponQualitiesList: WeaponQualityValue[]) {
    let weaponQualities = new UntypedFormArray([]);

    for (let weaponQuality of weaponQualitiesList) {
      weaponQualities.push(
        this.formBuilder.group({
          'quality': [weaponQuality.weaponQuality],
          'value': [weaponQuality.value]
        })
      )
    }

    return weaponQualities;
  }

  onAddWeaponQuality() {
    (<UntypedFormArray>this.form.get('weaponQualities')).push(
      this.formBuilder.group({
        'quality': [null],
        'value': [0]
      })
    );
  }

  onDeleteWeaponQuality(index: number) {
    (<UntypedFormArray>this.form.get('weaponQualities')).removeAt(index);
  }

  get weaponQualities() {
    return (<UntypedFormArray>this.form.get('weaponQualities')).controls;
  }

  compareModels(c1: Model, c2: Model): boolean {
    return c1 && c2 ? c1.name === c2.name : c1 === c2;
  }

  onSave() {
    if (this.form.valid) {
      let weapon: Weapon;
      if (this.weapon.isBaseWeapon || this.form.value.name != this.weapon.name || this.form.value.nameTranslation != this.weapon.nameTranslation) {
        this.modifyWeapon(this.modifiedWeapon);
        weapon = this.modifiedWeapon;
        weapon.id = null;
      } else {
        this.modifyWeapon(this.weapon);
        weapon = this.weapon;
      }

      this.dialogRef.close(weapon);
    }
  }

  private modifyWeapon(weapon: Weapon) {
    weapon.name = this.form.value.name;
    weapon.nameTranslation = this.form.value.nameTranslation;
    weapon.weaponType = this.form.value.weaponType;
    weapon.weaponGroup = this.form.value.weaponGroup;
    weapon.weaponReach = this.form.value.weaponReach;
    weapon.weaponRange = this.form.value.weaponRange;
    weapon.damage = this.form.value.damage;
    weapon.price = this.form.value.price ?? '-';
    weapon.encumbrance = this.form.value.encumbrance ?? '-';
    weapon.availability = this.form.value.availability;

    weapon.weaponQualities = [];
    for (let formWeaponQuality of this.form.value.weaponQualities) {
      let weaponQuality = new WeaponQualityValue(formWeaponQuality.quality, formWeaponQuality.value);
      weapon.weaponQualities.push(weaponQuality);
    }
  }

}
