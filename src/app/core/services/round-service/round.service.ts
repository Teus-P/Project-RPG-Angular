import {Injectable} from '@angular/core';
import {SkirmishCharacter} from "../../model/skirmish/skirmish-character.model";
import {HttpClient} from "@angular/common/http";
import {EndTurnCheck} from "../../model/end-turn-check/end-turn-check.model";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {RollDialogWindow} from "../../../shared/components/dialog-window/roll-dialog-window/roll-dialog-window.component";
import {MatDialog} from "@angular/material/dialog";
import {TranslateService} from "../translate-service/translate.service";

@Injectable({
  providedIn: 'root'
})
export class RoundService {

  private _roundNumber: number = 1;
  public endTurnCheck: EndTurnCheck;

  constructor(private http: HttpClient,
              private modalService: NgbModal,
              private translationService: TranslateService,
              private dialog: MatDialog) {
    let roundNumber = JSON.parse(<string>localStorage.getItem('roundNumber'));
    if (roundNumber != null) {
      this.roundNumber = roundNumber;
    } else {
      localStorage.setItem('roundNumber', JSON.stringify(this._roundNumber));
    }
    this.endTurnCheck = new EndTurnCheck(roundNumber);
  }

  async nextRound() {
    this.roundNumber += 1;
    localStorage.setItem('roundNumber', JSON.stringify(this._roundNumber));
    this.endTurnCheck.tests = [];
    await this.postEndTurnCheck(this.endTurnCheck);
  }

  async postEndTurnCheck(endTurnCheck: EndTurnCheck) {
    return await this.http.post<EndTurnCheck>('http://localhost:8080/endTurnCheck', endTurnCheck).toPromise()
      .then(async data => {
        let endTurnCheck = new EndTurnCheck();
        Object.assign(endTurnCheck, data);
        if (endTurnCheck.tests.length > 0) {
          for (let test of endTurnCheck.tests) {
            let skirmishCharacter = new SkirmishCharacter();
            Object.assign(skirmishCharacter, test.skirmishCharacter);
            test.skirmishCharacter = skirmishCharacter;

            this.translationService.prepareCondition(test.condition);
          }
          await this.testRolls(endTurnCheck);
        }
      })
  }

  async testRolls(endTurnCheck: EndTurnCheck) {
    const dialogRef = this.dialog.open(RollDialogWindow, {
      width: '20%',
      data: {endTurnCheck: endTurnCheck, testType: "Testy Stanów"}
    })

    await dialogRef.afterClosed().toPromise().then(async () => {
        await this.postEndTurnTestsCheck(endTurnCheck);
      }
    );
  }

  async postEndTurnTestsCheck(endTurnCheck: EndTurnCheck) {
    return this.http.post<EndTurnCheck>('http://localhost:8080/endTurnTestsCheck', endTurnCheck).toPromise();
  }

  get roundNumber(): number {
    return JSON.parse(<string>localStorage.getItem('roundNumber'));
  }

  set roundNumber(value: number) {
    this._roundNumber = value;
  }

  clearData() {
    this.roundNumber = 1;
    localStorage.setItem('roundNumber', JSON.stringify(this._roundNumber));
  }
}
