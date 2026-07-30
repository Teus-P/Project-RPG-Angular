import {Component, Inject, OnInit} from '@angular/core';
import {Armor} from "../../../../core/model/armor/armor.model";
import {FormBuilder, UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators} from "@angular/forms";
import {ArmorService} from "../../../../core/services/armor-service/armor.service";
import {BodyLocalizationService} from "../../../../core/services/body-localization-service/body-localization.service";
import {Model} from "../../../../core/model/model";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {TextResourceService} from "../../../../core/services/text-resource-service/text-resource.service";
import {AvailabilityService} from "../../../../core/services/availability-service/availability.service";
import {BodyLocalization} from "../../../../core/model/body-localization/body-localization.model";

@Component({
    selector: 'app-edit-armor-dialog',
    templateUrl: './edit-armor-dialog.component.html',
    styleUrls: ['./edit-armor-dialog.component.css'],
    standalone: false
})
export class EditArmorDialog implements OnInit {

  form!: UntypedFormGroup;
  modifiedArmor = new Armor();
  text = TextResourceService;

  constructor(public dialogRef: MatDialogRef<EditArmorDialog>,
              @Inject(MAT_DIALOG_DATA) public armor: Armor,
              public armorService: ArmorService,
              public bodyLocalizationService: BodyLocalizationService,
              public availabilityService: AvailabilityService,
              private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm() {
    Object.assign(this.modifiedArmor, this.armor);
    this.form = this.formBuilder.group({
      'name': [this.modifiedArmor.name ?? null, Validators.required],
      'nameTranslation': [this.modifiedArmor.nameTranslation ?? null, Validators.required],
      'armorCategory': [this.modifiedArmor.armorCategory ?? this.armorService.armorCategoriesList[0]],
      'armorPoints': [this.modifiedArmor.armorPoints ?? null],
      'bodyLocalizations': this.prepareBodyLocalizationsList(this.modifiedArmor.bodyLocalizations ?? []),
      'armorPenalties': this.prepareArmorPenaltiesList(this.modifiedArmor.armorPenalties ?? []),
      'armorQualities': this.prepareArmorQualitiesList(this.modifiedArmor.armorQualities ?? []),
      'price': [this.modifiedArmor.price ?? null],
      'encumbrance': [this.modifiedArmor.encumbrance ?? null],
      'availability': [this.modifiedArmor.availability ?? this.availabilityService.availabilityList[0]],
      'layer': [this.modifiedArmor.layer ?? null],
      'armorType': [this.modifiedArmor.armorType ?? this.armorService.armorTypesList[0]]
    })
  }

  prepareBodyLocalizationsList(bodyLocalizations: BodyLocalization[]) {
    let armorBodyLocalizations = this.formBuilder.array([]);

    for (let armorBodyLocalization of bodyLocalizations) {
      armorBodyLocalizations.push(this.formBuilder.control(armorBodyLocalization));
    }

    return armorBodyLocalizations;
  }

  prepareArmorPenaltiesList(armorPenaltiesList: Model[]) {
    let armorPenalties = this.formBuilder.array([])

    for (let armorPenalty of armorPenaltiesList) {
      armorPenalties.push(this.formBuilder.control(armorPenalty));
    }

    return armorPenalties;
  }

  prepareArmorQualitiesList(armorQualitiesList: Model[]) {
    let armorQualities = this.formBuilder.array([])

    for (let armorQuality of armorQualitiesList) {
      armorQualities.push(this.formBuilder.control(armorQuality)
      );
    }

    return armorQualities;
  }

  onAddBodyLocalization() {
    (<UntypedFormArray>this.form.get('bodyLocalizations')).push(
      this.formBuilder.control(null)
    );
  }

  onAddArmorPenalty() {
    (<UntypedFormArray>this.form.get('armorPenalties')).push(
      this.formBuilder.control(null)
    );
  }

  onAddArmorQuality() {
    (<UntypedFormArray>this.form.get('armorQualities')).push(
      this.formBuilder.control(null)
    );
  }

  onSave() {
    if (this.form.valid) {
      let armor: Armor;
      if (this.form.value.name != this.armor.name || this.form.value.nameTranslation != this.armor.nameTranslation) {
        this.modifyArmor(this.modifiedArmor);
        armor = this.modifiedArmor;
        armor.id = null;
      } else {
        this.modifyArmor(this.armor);
        armor = this.armor;
      }

      this.dialogRef.close(armor);
    }
  }

  modifyArmor(armor: Armor) {
    armor.name = this.form.value.name;
    armor.nameTranslation = this.form.value.nameTranslation;
    armor.armorCategory = this.form.value.armorCategory;
    armor.armorPoints = this.form.value.armorPoints;
    armor.bodyLocalizations = <BodyLocalization[]>this.form.value.bodyLocalizations;
    armor.armorPenalties = <Model[]>this.form.value.armorPenalties;
    armor.armorQualities = <Model[]>this.form.value.armorQualities;
    armor.price = this.form.value.price ?? '-';
    armor.encumbrance = this.form.value.encumbrance ?? '-';
    armor.availability = this.form.value.availability;
    armor.layer = this.form.value.layer;
    armor.armorType = this.form.value.armorType;
  }

  get bodyLocalizations() {
    return <UntypedFormControl[]>(<UntypedFormArray>this.form.get('bodyLocalizations')).controls;
  }

  get armorPenalties() {
    return <UntypedFormControl[]>(<UntypedFormArray>this.form.get('armorPenalties')).controls;
  }

  get armorQualities() {
    return <UntypedFormControl[]>(<UntypedFormArray>this.form.get('armorQualities')).controls;
  }

  onSetBodyLocalizations(event: any, i: number) {
    this.bodyLocalizations[i].value.value = event.target.value;
  }

  onDeleteBodyLocalization(index: number) {
    (<UntypedFormArray>this.form.get('bodyLocalizations')).removeAt(index);
  }

  onDeleteArmorPenalty(index: number) {
    (<UntypedFormArray>this.form.get('armorPenalties')).removeAt(index);
  }

  onDeleteArmorQuality(index: number) {
    (<UntypedFormArray>this.form.get('armorQualities')).removeAt(index);
  }

  compareModels(c1: Model, c2: Model): boolean {
    return c1 && c2 ? c1.name === c2.name : c1 === c2;
  }
}
