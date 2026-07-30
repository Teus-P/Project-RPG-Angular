import {Component, Input} from '@angular/core';
import {TextResourceService} from "../../../../core/services/text-resource-service/text-resource.service";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  Validators
} from "@angular/forms";
import {Model} from "../../../../core/model/model";
import {ConditionService} from "../../../../core/services/condition-service/condition.service";
import {CharacterCondition} from "../../../../core/model/condition/character-condition.model";

@Component({
  selector: 'app-conditions-edit',
  templateUrl: './conditions-edit.component.html',
  styleUrls: ['./conditions-edit.component.css'],
  standalone: false
})
export class ConditionsEditComponent {
  @Input() editCharacterForm!: FormGroup
  text = TextResourceService

  constructor(public conditionService: ConditionService,
              private formBuilder: FormBuilder) {
  }

  checkIfConditionHasCounter(conditionControl: AbstractControl) {
    if (conditionControl.value.condition.hasCounter != null && !conditionControl.value.condition.hasCounter) {
      (<UntypedFormGroup>conditionControl.get('counter')).disable()
    } else {
      (<UntypedFormGroup>conditionControl.get('counter')).enable()
    }
  }

  compareModels(c1: Model, c2: Model): boolean {
    return c1 && c2 ? c1.name === c2.name : c1 === c2
  }

  static prepareConditionsList(conditions: FormArray, conditionsList: CharacterCondition[]) {
    const formBuilder = new FormBuilder();

    for (let characterCondition of conditionsList) {

      let counter = formBuilder.control(
        characterCondition.counter,
        [Validators.min(0), Validators.required]
      )
      if (!characterCondition.condition.hasCounter) {
        counter.disable()
      }

      conditions.push(
        formBuilder.group({
          'id': [characterCondition.id],
          'condition': [characterCondition.condition],
          'value': [characterCondition.value],
          'counter': counter
        })
      )
    }
  }

  onAddCondition() {
    (<UntypedFormArray>this.editCharacterForm.get('conditions')).push(
      this.formBuilder.group({
        'condition': [null],
        'value': [1],
        'counter': [{value: null, disabled: true}, [Validators.min(0), Validators.required]]
      })
    )
  }

  onDeleteCondition(index: number) {
    (<UntypedFormArray>this.editCharacterForm.get('conditions')).removeAt(index)
  }

  get conditions() {
    return <UntypedFormControl[]>(<UntypedFormArray>this.editCharacterForm.get('conditions')).controls
  }
}
