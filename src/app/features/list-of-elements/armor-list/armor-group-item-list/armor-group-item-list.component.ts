import {Component, OnInit, ViewChild, DestroyRef, inject} from '@angular/core'
import {takeUntilDestroyed} from "@angular/core/rxjs-interop"
import {Armor} from "../../../../core/model/armor/armor.model"
import {TextResourceService} from "../../../../core/services/text-resource-service/text-resource.service"
import {ArmorService} from "../../../../core/services/armor-service/armor.service"
import {MatBottomSheet} from "@angular/material/bottom-sheet"
import {Model} from "../../../../core/model/model"
import {
  BottomSheetDescription
} from "../../../../shared/components/bottom-sheet/bottom-sheet-description/bottom-sheet-description.component"
import {MatMenuTrigger} from "@angular/material/menu"
import {
  ConfirmationDialogComponent
} from "../../../../shared/components/dialog-window/confirmation-dialog/confirmation-dialog.component"
import {MatDialog} from "@angular/material/dialog"
import {
  EditArmorDialog
} from "../../../../shared/components/dialog-window/edit-armor-dialog/edit-armor-dialog.component"

@Component({
    selector: 'app-armor-group-item-list',
    templateUrl: './armor-group-item-list.component.html',
    styleUrls: ['./armor-group-item-list.component.css'],
    standalone: false
})
export class ArmorGroupItemList implements OnInit {
  private destroyRef = inject(DestroyRef)
  armorGroups!: { name: string, armors: Armor[] }[]
  text = TextResourceService
  armorsColumns: string[] = ['name', 'price', 'enc', 'availability', 'category', 'localization', 'armorPoints', 'penalties', 'qualities']

  @ViewChild(MatMenuTrigger) contextMenu!: MatMenuTrigger
  contextMenuPosition = {x: '0px', y: '0px'}

  constructor(private armorService: ArmorService,
              private bottomSheet: MatBottomSheet,
              public dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.armorService.armorsListChanged.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (armors: Armor[]) => {
        this.groupArmors(armors)
      }
    )
    this.groupArmors(this.armorService.armorsList)
  }

  private groupArmors(armors: Armor[]) {
    this.armorGroups = []
    armors.forEach(armor => {
      let armorGroup = this.armorGroups.find(a => a.name === armor.armorCategory.nameTranslation)
      if (armorGroup != undefined) {
        armorGroup.armors.push(armor)
      } else {
        this.armorGroups.push({armors: [armor], name: armor.armorCategory.nameTranslation})
      }
    })
  }

  openBottomSheet(model: Model) {
    this.bottomSheet.open(BottomSheetDescription, {
      data: {nameTranslation: model.nameTranslation, description: model.description},
      panelClass: 'bottom-sheet'
    })
  }

  onContextMenu(event: MouseEvent, armor: Armor) {
    event.preventDefault()
    this.contextMenuPosition.x = event.clientX + 'px'
    this.contextMenuPosition.y = event.clientY + 'px'
    this.contextMenu.menuData = {'armor': armor}
    // @ts-ignore
    this.contextMenu.menu.focusFirstItem('mouse')
    this.contextMenu.openMenu()
  }

  async onAddArmor() {
    await this.createEditArmorDialogWindow(new Armor())
  }

  async onEditArmor(armor: Armor) {
    await this.createEditArmorDialogWindow(armor)
  }

  createEditArmorDialogWindow(armor: Armor) {
    const dialogRef = this.dialog.open(EditArmorDialog, {
      width: '30%',
      data: armor,
    })

    dialogRef.afterClosed().subscribe(armor => {
      if (armor != undefined) {
        this.armorService.storeArmor(armor).then(() => {
          this.groupArmors(this.armorService.armorsList)
          return Promise.resolve({weapon: armor})
        })
      }
    })
  }

  onDeleteArmor(id: number) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px'
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.armorService.removeArmor(id).then(() => {
          this.groupArmors(this.armorService.armorsList)
        })
      }
    })
  }
}
