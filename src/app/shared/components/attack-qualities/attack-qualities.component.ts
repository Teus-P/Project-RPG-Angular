import {Component, Input} from '@angular/core';
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {AttackQuality} from "../../../core/model/receive-damage/attack-result.model";
import {TextResourceService} from "../../../core/services/text-resource-service/text-resource.service";
import {BottomSheetDescription} from "../bottom-sheet/bottom-sheet-description/bottom-sheet-description.component";

@Component({
  selector: 'app-attack-qualities',
  imports: [NgForOf, NgIf, NgClass],
  templateUrl: './attack-qualities.component.html',
  styleUrl: './attack-qualities.component.css'
})
export class AttackQualitiesComponent {
  text = TextResourceService;

  @Input() qualities: AttackQuality[] = [];
  @Input() onlyRelevant = false;
  @Input() showLegend = true;

  constructor(private bottomSheet: MatBottomSheet) {
  }

  get visibleQualities(): AttackQuality[] {
    return this.onlyRelevant ? this.qualities.filter(quality => quality.relevance !== 'NONE') : this.qualities;
  }

  get hasApplied(): boolean {
    return this.visibleQualities.some(quality => quality.relevance === 'APPLIED');
  }

  get hasReminder(): boolean {
    return this.visibleQualities.some(quality => quality.relevance === 'REMINDER');
  }

  label(quality: AttackQuality): string {
    const name = TextResourceService.getTranslation('weaponQualities', quality.name).nameTranslation || quality.name;
    return quality.value && quality.value !== '1' ? `${name} ${quality.value}` : name;
  }

  open(quality: AttackQuality) {
    const model = TextResourceService.getTranslation('weaponQualities', quality.name);
    this.bottomSheet.open(BottomSheetDescription, {
      data: {nameTranslation: model.nameTranslation || quality.name, description: model.description},
      panelClass: 'bottom-sheet'
    });
  }
}
