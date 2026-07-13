import {Component, Input} from '@angular/core';
import {Character} from "../../../../core/model/character/character.model";
import {TextResourceService} from "../../../../core/services/text-resource-service/text-resource.service";
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {Model} from "../../../../core/model/model";
import {BottomSheetDescription} from "../../bottom-sheet/bottom-sheet-description/bottom-sheet-description.component";
import {FlexLayoutModule} from "@angular/flex-layout";
import {MatTabsModule} from "@angular/material/tabs";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef,
  MatRow, MatRowDef,
  MatTable
} from "@angular/material/table";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-details-conditions',
  templateUrl: './details-conditions.component.html',
  styleUrl: './details-conditions.component.css',
  imports: [
    MatTabsModule,
    FlexLayoutModule,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatCellDef,
    MatHeaderRow,
    MatRow,
    MatHeaderCellDef,
    MatHeaderRowDef,
    MatRowDef,
    NgIf
  ]
})
export class DetailsConditionsComponent {
  @Input() character!: Character
  text = TextResourceService
  baseColumns: string[] = ['name', 'level']

  constructor(protected bottomSheet: MatBottomSheet) {
  }

  openBottomSheet(model: Model) {
    this.bottomSheet.open(BottomSheetDescription, {
      data: {nameTranslation: model.nameTranslation, description: model.description},
      panelClass: 'bottom-sheet'
    })
  }
}
