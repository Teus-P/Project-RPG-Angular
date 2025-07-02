import {Component, Input, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, UntypedFormArray} from "@angular/forms";
import {TextResourceService} from "../../../../core/services/text-resource-service/text-resource.service";
import {Model} from "../../../../core/model/model";
import {Armor} from "../../../../core/model/armor/armor.model";
import {ArmorService} from "../../../../core/services/armor-service/armor.service";
import {EditArmorDialog} from "../../dialog-window/edit-armor-dialog/edit-armor-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {CharacterArmor} from "../../../../core/model/armor/character-armor.model";
import {Observable} from "rxjs";
import {ArmorGroup} from "../../../../core/model/armor/armor-group.model";
import {map, startWith} from "rxjs/operators";

@Component({
  selector: 'app-armor-edit',
  templateUrl: './armor-edit.component.html',
  styleUrls: ['./armor-edit.component.css'],
  standalone: false
})
export class ArmorEditComponent implements OnInit {
  @Input() editCharacterForm!: FormGroup
  text = TextResourceService
  armorsList: Armor[] = []
  armorGroups: ArmorGroup[] = []
  filteredList: Observable<ArmorGroup[]>[] = [];

  constructor(public armorService: ArmorService,
              public dialog: MatDialog,
              private formBuilder: FormBuilder) {
    this.armorsList = this.armorService.armorsList
  }

  ngOnInit(): void {
    this.armorGroups = this.armorService.armorsGroups
    this.armorsList = this.armorService.armorsList
    this.armors.forEach(group => {
      this.initializeFilteredList(group)
    })
  }

  private initializeFilteredList(group: FormGroup) {
    this.filteredList.push(group.valueChanges.pipe(
      startWith(''),
      map(value => (typeof value.armor === 'string' ? value.armor : value?.nameTranslation)),
      map(nameTranslation => this._filterGroup(nameTranslation || ''))
    ))
  }

  private _filterGroup(value: string): ArmorGroup[] {
    if (value) {
      return this.armorGroups
        .map(group => ({name: group.name, armors: this._filter(group.armors, value)}))
        .filter(group => group.armors.length > 0);
    }

    return this.armorGroups
  }

  private _filter(armor: Armor[], value: string): Armor[] {
    const filterValue = value.toLowerCase();
    return armor.filter(armor =>
      armor.nameTranslation.toLowerCase().includes(filterValue))
  }

  onFocusOut(i: number) {
    setTimeout(() => {
      this.validateSelection(i);
    }, 100)
  }

  validateSelection(i: number) {
    const control = this.armors[i]
    if (typeof control.value.armor == 'string') {
      const result = this._filterGroup(control.value.armor.toLowerCase());
      if (result.length == 1 && result[0].armors.length == 1) {
        control.patchValue({armor: result[0].armors[0], id: 0});
      } else {
        control.patchValue({armor: ''});
      }
    } else  {
      control.patchValue({id: 0});
    }
  }

  async onEditArmor(index: number) {
    const characterArmor = (this.editCharacterForm.get('armors') as FormArray).at(index).value;
    this.createEditArmorDialogWindow(characterArmor.armor.id)
    this.armorsList = this.armorService.armorsList
    this.armorGroups = this.armorService.armorsGroups
  }

  createEditArmorDialogWindow(index: number) {
    const dialogRef = this.dialog.open(EditArmorDialog, {
      width: '30%',
      data: (<FormGroup>this.armors[index]).value.armor,
    })

    dialogRef.afterClosed().subscribe(armor => {
      if (armor != undefined) {
        this.armorService.storeArmor(armor).then(() => {
          if (armor != null) {
            this.armorsList = this.armorService.armorsList
            this.armorGroups = this.armorService.armorsGroups
            return Promise.resolve({armor: armor})
          } else {
            return Promise.resolve({armor: (<FormGroup>this.armors[index]).value})
          }
        })
      }
    })
  }

  static prepareArmorList(armorsForms: UntypedFormArray, characterArmors: CharacterArmor[]) {
    const formBuilder = new FormBuilder()
    for (let characterArmor of characterArmors) {
      armorsForms.push(formBuilder.group({
        'id': [characterArmor.id],
        'armor': [characterArmor.armor],
        'armorBodyLocalizations': [characterArmor.armorBodyLocalizations],
        'armorPoints': [characterArmor.armorBodyLocalizations[0].armorPoints],
        'duration': [characterArmor.duration]
      }));
    }
  }

  onAddArmor() {
    const control = this.formBuilder.group({
      'id': [null],
      'armor': [null],
      'armorBodyLocalizations': [null],
      'armorPoints': [null],
      'duration': [null]
    });
    (<UntypedFormArray>this.editCharacterForm.get('armors')).push(control);
    this.initializeFilteredList(control)
  }

  onDeleteArmor(index: number) {
    (<UntypedFormArray>this.editCharacterForm.get('armors')).removeAt(index);
    this.filteredList.splice(index, 1);
  }

  displayFn(model?: Model): string {
    return model ? model.nameTranslation : '';
  }

  get armors() {
    return <FormGroup[]>(<UntypedFormArray>this.editCharacterForm.get('armors')).controls
  }

  isMagicalArmor(index: number, control: FormGroup): boolean {
    if (typeof control.value.armor != 'string') {
      const armor = (this.editCharacterForm.get('armors') as FormArray).at(index).value;
      return armor.armor != null && armor.armor.armorType.name === 'MAGICAL';
    }
    return false;
  }
}
