import {Component, Input, OnInit} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup
} from "@angular/forms";
import {TextResourceService} from "../../../../core/services/text-resource-service/text-resource.service";
import {Model} from "../../../../core/model/model";
import {Observable} from "rxjs";
import {map, startWith} from "rxjs/operators";

@Component({
  selector: 'app-select-list',
  templateUrl: './select-list.component.html',
  styleUrls: ['./select-list.component.css'],
  standalone: false
})
export class SelectListComponent implements OnInit {
  @Input() editCharacterForm!: FormGroup;
  @Input() formArrayName!: string;
  @Input() list!: Model[]
  @Input() titleLabel!: string;
  @Input() addButtonLabel!: string;
  @Input() additionalData?: any[];
  text = TextResourceService;
  filteredList: Observable<Model[]>[] = []

  constructor(private formBuilder: FormBuilder,
              private untypedFormBuilder: UntypedFormBuilder) {
  }

  ngOnInit() {
    this.initializeFilteredList()
  }

  initializeFilteredList() {
    this.filteredList = [];
    this.formArrays.forEach(group => {
      const control = group.get('model') as UntypedFormControl;
      this.filteredList.push(control?.valueChanges.pipe(
        startWith(''),
        map(value => (typeof value === 'string' ? value : value?.nameTranslation)),
        map(nameTranslationResult => (nameTranslationResult ? this._filter(nameTranslationResult) : this.list.slice()))
      ));
    })
  }

  private _filter(nameTranslation: string): Model[] {
    const filterValue = nameTranslation.toLowerCase();
    return this.list.filter(option => option.nameTranslation.toLowerCase().includes(filterValue));
  }

  onFocusOut(i: number, formArray: AbstractControl) {
    setTimeout(() => {
      this.validateSelection(i, formArray);
    }, 100)
  }

  validateSelection(i: number, formArray: AbstractControl) {
    const control = this.formArrays[i]
    if (typeof control.value.model == 'string') {
      const result = this._filter(control.value.model.toLowerCase());
      if (result.length == 1) {
        control.patchValue({model: result[0]});
      } else {
        control.patchValue({model: ''});
      }
    } else {
      this.checkIfTraitHasValue(formArray)
    }
  }

  checkIfTraitHasValue(formArray: AbstractControl) {
    const hasValue = formArray.value.model?.hasValue ?? true;
    if (formArray.value.model != null && !hasValue) {
      (<UntypedFormGroup>formArray.get('value')).disable();
    } else {
      (<UntypedFormGroup>formArray.get('value')).enable();
    }
  }

  onAddFormArray() {
    (this.editCharacterForm.get(this.formArrayName) as FormArray).push(this.createFormArray());
  }

  createFormArray(): FormGroup {
    const control = this.untypedFormBuilder.control('');
    this.filteredList.push(control.valueChanges.pipe(
      startWith(''),
      map(value => (typeof value === 'string' ? value : value?.nameTranslation)),
      map(nameTranslationResult => (nameTranslationResult ? this._filter(nameTranslationResult) : this.list.slice()))
    ));

    const newFormGroup = this.formBuilder.group({});

    newFormGroup.addControl('model', control)
    newFormGroup.addControl('value', this.formBuilder.control(1));

    if (this.formArrayName === 'injuries') {
      newFormGroup.addControl('bodyLocalization', this.formBuilder.control(null));
    }

    return newFormGroup;
  }

  onDeleteFormArray(index: number) {
    (this.editCharacterForm.get(this.formArrayName) as FormArray).removeAt(index);
    this.filteredList.splice(index, 1);
  }

  displayFn(model?: Model): string {
    return model ? model.nameTranslation : '';
  }

  get formArrays() {
    return (this.editCharacterForm.get(this.formArrayName) as FormArray).controls;
  }
}
