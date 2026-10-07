import {Component, Input, OnInit} from '@angular/core';
import {SkirmishCharacter} from "../../../../core/model/skirmish/skirmish-character.model";
import {TextResourceService} from "../../../../core/services/text-resource-service/text-resource.service";

@Component({
    selector: 'app-skirmish-character-item',
    templateUrl: './skirmish-character-item.component.html',
    styleUrls: ['./skirmish-character-item.component.css'],
    standalone: false
})
export class SkirmishCharacterItemComponent implements OnInit {
  @Input() skirmishCharacter!: SkirmishCharacter;
  @Input() index!: number;

  text = TextResourceService;

  constructor() {
  }

  ngOnInit(): void {
  }

  getSegmentGap(): number {
    const max = this.skirmishCharacter.character.wounds.value;
    return Math.max(0, Math.min(2, 2 - (max - 20) * 0.03));
  }

  isDense(): boolean {
    return this.skirmishCharacter.character.wounds.value > 40;
  }

  getHealthSegments(): boolean[] {
    const max = this.skirmishCharacter.character.wounds.value;
    const current = Math.max(0, Math.min(max, this.skirmishCharacter.currentWounds));
    return Array.from({length: Math.max(0, max)}, (_, i) => i < current);
  }

  getHealthSegmentColor(): string {
    const {r, g, b} = this.getHealthColor(this.getHealthPercentage());
    return `rgb(${r}, ${g}, ${b})`;
  }

  private getHealthPercentage(): number {
    if (this.skirmishCharacter.isDead) {
      return 0;
    }
    const maxHealth = this.skirmishCharacter.character.wounds.value;
    const currentHealth = this.skirmishCharacter.currentWounds;
    return Math.max(0, Math.min(100, (currentHealth / maxHealth) * 100));
  }

  private getHealthColor(healthPercentage: number) {
    const critical = {r: 138, g: 47, b: 37};
    const wounded = {r: 176, g: 138, b: 58};
    const healthy = {r: 107, g: 124, b: 62};

    if (healthPercentage >= 50) {
      return this.mixColors(wounded, healthy, (healthPercentage - 50) / 50);
    }
    return this.mixColors(critical, wounded, healthPercentage / 50);
  }

  private mixColors(from: { r: number; g: number; b: number }, to: { r: number; g: number; b: number }, ratio: number) {
    return {
      r: Math.round(from.r + (to.r - from.r) * ratio),
      g: Math.round(from.g + (to.g - from.g) * ratio),
      b: Math.round(from.b + (to.b - from.b) * ratio),
    };
  }
}
