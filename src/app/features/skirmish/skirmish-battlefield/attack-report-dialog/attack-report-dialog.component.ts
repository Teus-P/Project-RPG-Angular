import {Component, Inject} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {MAT_DIALOG_DATA, MatDialogModule} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {TextResourceService} from "../../../../core/services/text-resource-service/text-resource.service";
import {AttackQualitiesComponent} from "../../../../shared/components/attack-qualities/attack-qualities.component";
import {AttackReport} from "../../../../shared/utils/attack-report";
import {describeBreakdownEntry, describeMitigation, describeShieldChange} from "../../../../shared/utils/attack-breakdown";

@Component({
  selector: 'app-attack-report-dialog',
  imports: [NgIf, NgForOf, MatDialogModule, MatButtonModule, AttackQualitiesComponent],
  templateUrl: './attack-report-dialog.component.html'
})
export class AttackReportDialogComponent {
  text = TextResourceService;
  describeBreakdownEntry = describeBreakdownEntry;
  describeMitigation = describeMitigation;
  describeShieldChange = describeShieldChange;

  constructor(@Inject(MAT_DIALOG_DATA) public report: AttackReport) {
  }

  get woundsLost(): number {
    return this.report.woundsBefore - this.report.woundsAfter;
  }

  get hasNoEffect(): boolean {
    return this.woundsLost === 0
      && !this.report.hasDied
      && this.report.armorChanges.length === 0
      && this.report.newInjuries.length === 0
      && this.report.conditionChanges.length === 0;
  }
}
