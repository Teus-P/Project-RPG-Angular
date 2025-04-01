import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, UntypedFormArray} from "@angular/forms";
import {TextResourceService} from "../../../../core/services/text-resource-service/text-resource.service";
import {Model} from "../../../../core/model/model";
import {WeaponGroup} from "../../../../core/model/weapon/weapon-group.model";
import {WeaponService} from "../../../../core/services/weapon-service/weapon.service";
import {EditWeaponDialog} from "../../dialog-window/edit-weapon-dialog/edit-weapon-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {CharacterWeapon} from "../../../../core/model/weapon/character-weapon.model";
import {Observable} from "rxjs";
import {map, startWith} from "rxjs/operators";
import {Weapon} from "../../../../core/model/weapon/weapon.model";

@Component({
  selector: 'app-weapons-edit',
  templateUrl: './weapons-edit.component.html',
  styleUrls: ['./weapons-edit.component.css'],
  standalone: false
})
export class WeaponsEditComponent implements OnInit {
  @Input() editCharacterForm!: FormGroup
  text = TextResourceService
  weaponGroups: WeaponGroup[] = []
  filteredList: Observable<WeaponGroup[]>[] = [];

  constructor(public weaponService: WeaponService,
              public dialog: MatDialog,
              public formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.weaponGroups = this.weaponService.weaponGroups
    this.weapons.forEach(group => {
      this.initializeFilteredList(group)
    })
  }

  private initializeFilteredList(group: FormGroup) {
    this.filteredList.push(group.valueChanges.pipe(
      startWith(''),
      map(value => (typeof value.weapon === 'string' ? value.weapon : value?.weapon?.nameTranslation)),
      map(nameTranslation => this._filterGroup(nameTranslation || ''))
    ))
  }

  private _filterGroup(value: string): WeaponGroup[] {
    if (value) {
      return this.weaponGroups
        .map(group => ({name: group.name, type: group.type, weapons: this._filter(group.weapons, value)}))
        .filter(group => group.weapons.length > 0);
    }

    return this.weaponGroups
  }

  private _filter(weapons: Weapon[], value: string): Weapon[] {
    const filterValue = value.toLowerCase();
    return weapons.filter(weapon =>
      weapon.nameTranslation.toLowerCase().includes(filterValue))
  }

  onFocusOut(i: number) {
    setTimeout(() => {
      this.validateSelection(i);
    }, 100)
  }

  validateSelection(i: number) {
    const control = this.weapons[i]
    if (typeof control.value.weapon == 'string') {
      const result = this._filterGroup(control.value.weapon.toLowerCase());
      if (result.length == 1 && result[0].weapons.length == 1) {
        control.patchValue({weapon: result[0].weapons[0]});
      } else {
        control.patchValue({weapon: ''});
      }
    }
  }

  async onEditWeapon(index: number) {
    await this.createEditWeaponDialog(index)
    this.weaponGroups = this.weaponService.weaponGroups
  }

  createEditWeaponDialog(index: number) {
    const dialogRef = this.dialog.open(EditWeaponDialog, {
      width: '30%',
      data: (<FormGroup>this.weapons[index]).value.weapon,
    })

    dialogRef.afterClosed().subscribe(weapon => {
      if (weapon != undefined) {
        this.weaponService.storeWeapon(weapon).then(() => {
          if (weapon != null) {
            this.weaponGroups = this.weaponService.weaponGroups
            return Promise.resolve({weapon: weapon})
          } else {
            return Promise.resolve({weapon: (<FormGroup>this.weapons[index]).value})
          }
        })
      }
    })
  }

  compareModels(c1: Model, c2: Model): boolean {
    return c1 && c2 ? c1.name === c2.name : c1 === c2
  }

  static prepareWeaponsList(weapons: UntypedFormArray, characterWeapons: CharacterWeapon[]) {
    const formBuilder = new FormBuilder();
    for (let characterWeapon of characterWeapons) {
      weapons.push(formBuilder.group({
        'weapon': [characterWeapon.weapon],
        'value': [characterWeapon.value]
      }))
    }
  }

  onAddWeapon() {
    const control = this.formBuilder.group({
      'weapon': [null],
      'value': [1]
    });
    (<UntypedFormArray>this.editCharacterForm.get('weapons')).push(control);
    this.initializeFilteredList(control)
  }

  onDeleteWeapon(index: number) {
    (<UntypedFormArray>this.editCharacterForm.get('weapons')).removeAt(index);
    this.filteredList.splice(index, 1)
  }

  displayFn(model?: Model): string {
    return model ? model.nameTranslation : '';
  }

  get weapons() {
    return <FormGroup[]>(<UntypedFormArray>this.editCharacterForm.get('weapons')).controls
  }
}
