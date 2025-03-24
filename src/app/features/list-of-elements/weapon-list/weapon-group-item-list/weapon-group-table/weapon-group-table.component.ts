import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {TextResourceService} from "../../../../../core/services/text-resource-service/text-resource.service";
import {WeaponGroup} from "../../../../../core/model/weapon/weapons-group.model";
import {MatTableDataSource} from "@angular/material/table";
import {Model} from "../../../../../core/model/model";
import {
  BottomSheetDescription
} from "../../../../../shared/components/bottom-sheet/bottom-sheet-description/bottom-sheet-description.component";
import {WeaponService} from "../../../../../core/services/weapon-service/weapon.service";
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {MatDialog} from "@angular/material/dialog";
import {MatMenuTrigger} from "@angular/material/menu";
import {Weapon} from "../../../../../core/model/weapon/weapon.model";
import {
  EditWeaponDialog
} from "../../../../../shared/components/dialog-window/edit-weapon-dialog/edit-weapon-dialog.component";
import {
  ConfirmationDialogComponent
} from "../../../../../shared/components/dialog-window/confirmation-dialog/confirmation-dialog.component";

@Component({
  selector: 'app-weapon-group-table',
  templateUrl: './weapon-group-table.component.html',
  styleUrls: ['./weapon-group-table.component.css'],
  standalone: false
})
export class WeaponGroupTableComponent implements OnInit, OnChanges {
  @Input() weaponGroup!: WeaponGroup;
  @Input() filterValue?: string;
  text = TextResourceService;
  dataSource = new MatTableDataSource()
  weaponColumns: string[] = ['name', 'price', 'enc', 'availability', 'category', 'reach', 'damage', 'advantagesAndDisadvantages'];
  hasData: boolean = true;

  @ViewChild(MatMenuTrigger) contextMenu!: MatMenuTrigger;
  contextMenuPosition = {x: '0px', y: '0px'};

  constructor(private bottomSheet: MatBottomSheet,
              private weaponService: WeaponService,
              public dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.dataSource.data = this.weaponGroup.weapons;
    this.dataSource.filterPredicate = this.customFilterPredicate.bind(this);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['filterValue']) {
      this.applyFilter();
    }
  }

  applyFilter() {
    if (this.filterValue != undefined) {
      this.dataSource.filter = this.filterValue.trim().toLowerCase();
      this.hasData = this.dataSource.filteredData.length > 0;
    }
  }

  customFilterPredicate(data: any, filter: string): boolean {
    const name = data.nameTranslation ? data.nameTranslation.toLowerCase() : '';
    return name.includes(filter);
  }

  openBottomSheet(model: Model) {
    this.bottomSheet.open(BottomSheetDescription, {
      data: {nameTranslation: model.nameTranslation, description: model.description},
      panelClass: 'bottom-sheet'
    })
  }

  onContextMenu(event: MouseEvent, weapon: Weapon) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menuData = {'weapon': weapon};
    // @ts-ignore
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

  async onEditWeapon(weapon: Weapon) {
    await this.createEditWeaponDialog(weapon);
  }

  createEditWeaponDialog(weapon: Weapon) {
    const dialogRef = this.dialog.open(EditWeaponDialog, {
      width: '30%',
      data: weapon,
    });

    dialogRef.afterClosed().subscribe(weapon => {
      if (weapon != undefined) {
        this.weaponService.storeWeapon(weapon).then(() => {
          const foundGroup = this.weaponService.getWeaponGroups().find(g => g.type === this.weaponGroup.type)
          if (foundGroup == undefined) {
            throw new Error(`Weapon group of type ${this.weaponGroup.type} not found`);
          }
          this.weaponGroup = foundGroup
          return Promise.resolve({weapon: weapon});
        })
      }
    })
  }

  onDeleteWeapon(id: number) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.weaponService.removeWeapon(id).then(() => {
          const foundGroup = this.weaponService.getWeaponGroups().find(g => g.type === this.weaponGroup.type)
          if (foundGroup == undefined) {
            throw new Error(`Weapon group of type ${this.weaponGroup.type} not found`);
          }
        });
      }
    });
  }
}
