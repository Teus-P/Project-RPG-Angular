import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, UntypedFormArray, UntypedFormControl} from "@angular/forms";
import {TextResourceService} from "../../../../core/services/text-resource-service/text-resource.service";
import {Model} from "../../../../core/model/model";
import {SpellGroup} from "../../../../core/model/spell/spell-group.model";
import {SpellService} from "../../../../core/services/spell-service/spell.service";
import {Spell} from "../../../../core/model/spell/spell.model";
import {Observable} from "rxjs";
import {map, startWith} from "rxjs/operators";

@Component({
  selector: 'app-spells-edit',
  templateUrl: './spells-edit.component.html',
  styleUrls: ['./spells-edit.component.css'],
  standalone: false
})
export class SpellsEditComponent implements OnInit {
  @Input() editCharacterForm!: FormGroup
  text = TextResourceService
  spellGroups: SpellGroup[] = []
  filteredList: Observable<SpellGroup[]>[] = [];

  constructor(public spellService: SpellService,
              private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.spellGroups = this.spellService.spellGroups
    this.spells.forEach(group => {
      this.initializeFilteredList(group)
    })
  }

  initializeFilteredList(group: FormControl) {
    this.filteredList.push(group.valueChanges.pipe(
      startWith(''),
      map(value => (typeof value === 'string' ? value : value?.nameTranslation)),
      map(nameTranslation => this._filterGroup(nameTranslation || ''))
    ));
  }

  private _filterGroup(value: string): SpellGroup[] {
    if (value) {
      return this.spellGroups
        .map(group => ({name: group.name, spells: this._filter(group.spells, value)}))
        .filter(group => group.spells.length > 0);
    }

    return this.spellGroups
  }

  private _filter(spells: Spell[], value: string): Spell[] {
    const filterValue = value.toLowerCase();
    return spells.filter(spell =>
      spell.nameTranslation.toLowerCase().includes(filterValue))
  }

  onFocusOut(i: number) {
    setTimeout(() => {
      this.validateSelection(i);
    }, 100)
  }

  validateSelection(i: number) {
    const control = this.spells[i]
    if (typeof control.value == 'string') {
      const result = this._filterGroup(control.value.toLowerCase());
      if (result.length == 1 && result[0].spells.length == 1) {
        control.setValue(result[0].spells[0]);
      } else {
        control.setValue('');
      }
    }
  }

  static prepareSpellsList(spells: UntypedFormArray, spellsList: Spell[]) {
    const formBuilder = new FormBuilder();
    for (let spell of spellsList) {
      spells.push(
        formBuilder.control(spell)
      )
    }
  }

  onDeleteSpell(index: number) {
    (<UntypedFormArray>this.editCharacterForm.get('spells')).removeAt(index);
    this.filteredList.splice(index, 1);
  }

  onAddSpell() {
    const control = this.formBuilder.control(null);
    (<UntypedFormArray>this.editCharacterForm.get('spells')).push(control)
    this.initializeFilteredList(control)
  }

  displayFn(model?: Model): string {
    return model ? model.nameTranslation : '';
  }

  get spells() {
    return <UntypedFormControl[]>(<UntypedFormArray>this.editCharacterForm.get('spells')).controls
  }
}
