import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SkirmishCharacter} from "../../../../../../core/model/skirmish/skirmish-character.model";
import {
  SkirmishCharacterService
} from "../../../../../../core/services/skirmish-character-service/skirmish-character.service";
import {TextResourceService} from "../../../../../../core/services/text-resource-service/text-resource.service";
import {ConditionService} from "../../../../../../core/services/condition-service/condition.service";
import {Model} from "../../../../../../core/model/model";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  UntypedFormGroup,
  Validators
} from "@angular/forms";
import {CharacterCondition} from "../../../../../../core/model/condition/character-condition.model";
import {AddConditions} from "../../../../../../core/model/condition/add-conditions.model";

@Component({
    selector: 'app-add-condition-dialog',
    templateUrl: './add-condition-dialog.component.html',
    styleUrls: ['./add-condition-dialog.component.css'],
    standalone: false
})
export class AddConditionDialogComponent implements OnInit {

  skirmishCharacters!: SkirmishCharacter[]
  text = TextResourceService;

  conditionsForm!: FormGroup

  constructor(@Inject(MAT_DIALOG_DATA) public skirmishCharacter: SkirmishCharacter,
              private skirmishCharacterService: SkirmishCharacterService,
              public conditionService: ConditionService,
              public dialogRef: MatDialogRef<AddConditionDialogComponent>,
              public formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.skirmishCharacters = this.skirmishCharacterService.skirmishCharactersList
    this.conditionsForm = this.formBuilder.group({
      'conditions': this.formBuilder.array([])
    })
    this.skirmishCharacters.forEach(character => {
      if (character.id == null) {
        throw new Error("Character is without an id.");
      }
      if (character.id === this.skirmishCharacter.id) {
        this.conditionsForm.addControl(character.id.toString(), new FormControl(true))
      } else {
        this.conditionsForm.addControl(character.id.toString(), new FormControl(false))
      }
    })
  }

  compareModels(c1: Model, c2: Model): boolean {
    return c1 && c2 ? c1.name === c2.name : c1 === c2;
  }

  checkIfConditionHasCounter(conditionControl: AbstractControl) {
    if (conditionControl.value.condition.hasCounter != null && !conditionControl.value.condition.hasCounter) {
      (<UntypedFormGroup>conditionControl.get('counter')).disable();
    } else {
      (<UntypedFormGroup>conditionControl.get('counter')).enable();
    }
  }

  saveAndCloseDialog() {
    if(this.conditionsForm.invalid) {
      this.conditionsForm.markAllAsTouched();
      return;
    }
    const addConditions = new AddConditions(
      <CharacterCondition[]>this.conditionsForm.value.conditions,
      this.getSelectedCharacters()
    )

    this.dialogRef.close(addConditions)
  }

  onAddCondition() {
    (<FormArray>this.conditionsForm.get('conditions')).push(
      this.formBuilder.group({
        'condition': [null],
        'value': [1],
        'counter': [{value: null, disabled: true}, [Validators.min(0), Validators.required]]
      })
    )
  }

  onDeleteCondition(index: number) {
    (<FormArray>this.conditionsForm.get('conditions')).removeAt(index);
  }

  get conditions() {
    return <FormControl[]>(<FormArray>this.conditionsForm.get('conditions')).controls
  }

  getSelectedCharacters(): number[] {
    return this.skirmishCharacters
      .filter((character): character is SkirmishCharacter & { id: number } => character.id != null)
      .filter(character => this.conditionsForm.get(character.id.toString())?.value === true)
      .map(character => character.id);
  }
}
