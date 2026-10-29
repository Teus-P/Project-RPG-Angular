import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgClass, NgForOf} from "@angular/common";
import {CharacterBodyLocalization} from "../../../core/model/body-localization/character-body-localization.model";
import {TextResourceService} from "../../../core/services/text-resource-service/text-resource.service";

interface Zone {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rx: number;
}

/** The figure is seen from the front, so the character's right side is on the left of the picture. */
const ZONES: Zone[] = [
  {name: 'HEAD', x: 40, y: 6, w: 40, h: 40, rx: 20},
  {name: 'BODY', x: 38, y: 50, w: 44, h: 80, rx: 8},
  {name: 'RIGHT_ARM', x: 10, y: 52, w: 24, h: 76, rx: 10},
  {name: 'LEFT_ARM', x: 86, y: 52, w: 24, h: 76, rx: 10},
  {name: 'RIGHT_LEG', x: 38, y: 134, w: 20, h: 116, rx: 10},
  {name: 'LEFT_LEG', x: 62, y: 134, w: 20, h: 116, rx: 10},
];

@Component({
  selector: 'app-hit-location-picker',
  imports: [NgForOf, NgClass],
  templateUrl: './hit-location-picker.component.html',
  styleUrl: './hit-location-picker.component.css'
})
export class HitLocationPickerComponent {
  text = TextResourceService;
  zones = ZONES;

  @Input() localizations: CharacterBodyLocalization[] = [];
  @Input() selected: string | null = null;
  @Output() selectedChange = new EventEmitter<string>();

  find(name: string): CharacterBodyLocalization | undefined {
    return this.localizations.find(localization => localization.bodyLocalization.name === name);
  }

  has(name: string): boolean {
    return !!this.find(name);
  }

  armor(localization: CharacterBodyLocalization): number {
    return (localization.armorPoints ?? 0) + (localization.additionalArmorPoints ?? 0);
  }

  select(name: string) {
    if (this.has(name)) {
      this.selected = name;
      this.selectedChange.emit(name);
    }
  }
}
