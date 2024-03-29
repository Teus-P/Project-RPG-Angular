import {Component, Input, OnInit} from '@angular/core';
import {FormGroup, UntypedFormArray, UntypedFormControl, UntypedFormGroup} from "@angular/forms";
import {TextResourceService} from "../../shared/services/text-resource-service/text-resource.service";
import {Model} from "../../model/model";
import {WeaponGroup} from "../../model/weapon/weapons-group.model";
import {WeaponService} from "../../shared/services/weapon-service/weapon.service";
import {EditWeaponDialog} from "../../dialog-window/edit-weapon-dialog/edit-weapon-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {CharacterWeapon} from "../../model/weapon/character-weapon.model";

@Component({
  selector: 'app-weapons-edit',
  templateUrl: './weapons-edit.component.html',
  styleUrls: ['./weapons-edit.component.css']
})
export class WeaponsEditComponent implements OnInit{
  @Input() editCharacterForm!: FormGroup
  text = TextResourceService

  weaponGroups: WeaponGroup[] = []

  constructor(public weaponService: WeaponService,
              public dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.weaponGroups = this.weaponService.weaponGroups
  }

  async onEditWeapon(index: number) {
    await this.createEditWeaponDialog(index)
    this.weaponGroups = this.weaponService.weaponGroups
  }

  createEditWeaponDialog(index: number) {
    const dialogRef = this.dialog.open(EditWeaponDialog, {
      width: '30%',
      data: (<UntypedFormControl>this.weapons[index]).value.weapon,
    })

    dialogRef.afterClosed().subscribe(weapon => {
      if (weapon != undefined) {
        this.weaponService.storeWeapon(weapon).then(() => {
          if (weapon != null) {
            this.weaponGroups = this.weaponService.weaponGroups
            return Promise.resolve({weapon: weapon})
          } else {
            return Promise.resolve({weapon: (<UntypedFormControl>this.weapons[index]).value})
          }
        })
      }
    })
  }

  compareModels(c1: Model, c2: Model): boolean {
    return c1 && c2 ? c1.name === c2.name : c1 === c2
  }

  static prepareWeaponsList(weapons: UntypedFormArray, weaponsList: CharacterWeapon[]) {
    for (let weapon of weaponsList) {
      weapons.push(
        new UntypedFormGroup({
          'id': new UntypedFormControl(weapon.id),
          'weapon': new UntypedFormControl(weapon.weapon),
          'value': new UntypedFormControl(weapon.value)
        })
      )
    }
  }

  onAddWeapon() {
    (<UntypedFormArray>this.editCharacterForm.get('weapons')).push(
      new UntypedFormGroup({
        'weapon': new UntypedFormControl(null),
        'value': new UntypedFormControl(1),
      })
    )
  }

  onDeleteWeapon(index: number) {
    (<UntypedFormArray>this.editCharacterForm.get('weapons')).removeAt(index)
  }

  get weapons() {
    return <UntypedFormControl[]>(<UntypedFormArray>this.editCharacterForm.get('weapons')).controls
  }
}
