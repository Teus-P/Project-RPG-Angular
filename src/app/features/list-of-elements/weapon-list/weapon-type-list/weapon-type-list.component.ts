import {Component, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {WeaponService} from "../../../../core/services/weapon-service/weapon.service";
import {WeaponGroup} from "../../../../core/model/weapon/weapon-group.model";
import {TextResourceService} from "../../../../core/services/text-resource-service/text-resource.service";
import {Weapon} from "../../../../core/model/weapon/weapon.model";
import {EditWeaponDialog} from "../../../../shared/components/dialog-window/edit-weapon-dialog/edit-weapon-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
    selector: 'app-weapon-type-list',
    templateUrl: './weapon-type-list.component.html',
    styleUrls: ['./weapon-type-list.component.css'],
    standalone: false
})
export class WeaponTypeListComponent implements OnInit {
  subscription!: Subscription
  weaponTypes: string[] = []

  text = TextResourceService

  constructor(public weaponService: WeaponService,
              public dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.subscription = this.weaponService.weaponGroupsChanged.subscribe(
      (weaponGroups: WeaponGroup[]) => {
        this.groupWeaponCategories(weaponGroups);
      }
    )
    this.groupWeaponCategories(this.weaponService.getWeaponGroups());
  }

  groupWeaponCategories(weaponGroups: WeaponGroup[]) {
    this.weaponTypes = [];
    weaponGroups.sort((a, b) => a.name.localeCompare(b.name));
    weaponGroups.forEach(weaponGroup => {
      let weaponType = this.weaponTypes.find(weaponType => weaponType === weaponGroup.type);
      if (weaponType == undefined) {
        this.weaponTypes.push(weaponGroup.type);
      }
    })
  }

  async addWeapon() {
    await this.createEditWeaponDialog();
  }

  createEditWeaponDialog() {
    const dialogRef = this.dialog.open(EditWeaponDialog, {
      width: '30%',
      data: new Weapon(),
    });

    dialogRef.afterClosed().subscribe(weapon => {
      if (weapon != undefined) {
        this.weaponService.storeWeapon(weapon).then(() => {
          this.groupWeaponCategories(this.weaponService.getWeaponGroups())
          return Promise.resolve({weapon: weapon});
        })
      }
    })
  }
}
