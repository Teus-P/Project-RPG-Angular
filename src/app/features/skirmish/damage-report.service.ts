import {Injectable} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {SkirmishService} from "../../core/services/skirmish-service/skirmish.service";
import {SkirmishCharacterService} from "../../core/services/skirmish-character-service/skirmish-character.service";
import {SkirmishCharacter} from "../../core/model/skirmish/skirmish-character.model";
import {ReceivedDamage} from "../../core/model/receive-damage/receive-damage.model";
import {buildAttackReport} from "../../shared/utils/attack-report";
import {AttackReportDialogComponent} from "./skirmish-battlefield/attack-report-dialog/attack-report-dialog.component";

/**
 * Applies the damage chosen in the damage dialog and shows the same report afterwards,
 * whether it came from an attack on the map (with an attacker) or from a character card (without one).
 */
@Injectable({
  providedIn: 'root'
})
export class DamageReportService {

  constructor(private skirmishService: SkirmishService,
              private skirmishCharacterService: SkirmishCharacterService,
              private dialog: MatDialog) {
  }

  async applyAndReport(receivedDamage: ReceivedDamage,
                       target: SkirmishCharacter,
                       attacker?: SkirmishCharacter): Promise<SkirmishCharacter> {
    if (target.id == null) {
      throw new Error("Character is without an id.");
    }
    const result = await this.skirmishService.receiveDamage(receivedDamage);
    const targetAfter = await this.skirmishCharacterService.reloadSkirmishCharacter(target.id);
    this.dialog.open(AttackReportDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      data: buildAttackReport(attacker, target, targetAfter, receivedDamage, result)
    });
    return targetAfter;
  }
}
