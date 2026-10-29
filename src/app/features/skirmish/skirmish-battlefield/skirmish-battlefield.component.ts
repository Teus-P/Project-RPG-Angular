import {Component, ElementRef, HostListener, OnInit, ViewChild, DestroyRef, inject} from '@angular/core';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {NgClass, NgForOf, NgIf, NgStyle} from "@angular/common";
import {SkirmishCharacterService} from "../../../core/services/skirmish-character-service/skirmish-character.service";
import {SkirmishCharacter} from "../../../core/model/skirmish/skirmish-character.model";
import {TextResourceService} from "../../../core/services/text-resource-service/text-resource.service";
import {MatDialog} from "@angular/material/dialog";
import {MatMenuModule, MatMenuTrigger} from "@angular/material/menu";
import {ReceiveDamageDialog} from "../skirmish-character-details/skirmish-character-buttons/dialog-window/receive-damage-dialog/receive-damage-dialog.component";
import {ReceivedDamage} from "../../../core/model/receive-damage/receive-damage.model";
import {DamageReportService} from "../damage-report.service";

interface Token {
  name: string;
  skirmishCharacterId?: number | null;
  shortName: string;
  isDead: boolean;
  x: number;
  y: number;
  colorR: number;
  colorG: number;
  colorB: number;
  meleeTargetName?: string;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

@Component({
  selector: 'app-skirmish-battlefield',
  imports: [
    NgForOf,
    NgStyle,
    NgClass,
    NgIf,
    MatMenuModule
  ],
  templateUrl: './skirmish-battlefield.component.html',
  styleUrl: './skirmish-battlefield.component.css'
})
export class SkirmishBattlefieldComponent implements OnInit {
  private destroyRef = inject(DestroyRef)
  tokens: Token[] = [];

  text = TextResourceService;
  showLabels = localStorage.getItem('battleMapLabels') !== 'off';
  private labelSignature = '';
  private labelPlacements = new Map<string, 'below' | 'above' | null>();

  draggedToken: any = null;
  selectedToken: Token | null = null;
  menuTarget: Token | null = null;
  menuPosition = {x: 0, y: 0};
  private dragStartX = 0;
  private dragStartY = 0;
  private dragMoved = false;
  offsetX = 0;
  offsetY = 0;

  @ViewChild('battlefield', {static: true}) battlefield!: ElementRef<HTMLDivElement>;
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;


  constructor(private skirmishCharacterService: SkirmishCharacterService,
              private damageReportService: DamageReportService,
              private dialog: MatDialog) {
  }

  ngOnInit(): void {
    if (this.tokens.length == 0) {
      const storedTokensString = localStorage.getItem('battleMapTokens');
      this.tokens = storedTokensString ? JSON.parse(storedTokensString) : []
      const skirmishCharacters = this.skirmishCharacterService.getSkirmishCharacters()
      if (this.tokens.length == 0) {
        skirmishCharacters.forEach(skirmishCharacter => {
          this.skirmishCharactersToTokens(skirmishCharacter)
        })
      }
      this.assignSkirmishCharacterIds(skirmishCharacters)
    }

    this.skirmishCharacterService.skirmishCharactersChanged.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (skirmishCharacters: SkirmishCharacter[]) => {
        const tokensNames = new Set(this.tokens.map(token => token.name));
        const charactersNames = new Set(skirmishCharacters.map(skirmishCharacter => this.tokenName(skirmishCharacter)));

        for (const character of skirmishCharacters) {
          let name = this.tokenName(character);
          if (!tokensNames.has(name)) {
            this.skirmishCharactersToTokens(character)
          } else {
            let token = this.tokens.find(token => token.name === name)!;
            token.isDead = character.isDead;
            token.skirmishCharacterId = character.id;
          }
        }

        this.tokens = this.tokens.filter(token => charactersNames.has(token.name))
        localStorage.setItem('battleMapTokens', JSON.stringify(this.tokens))
      }
    )
  }

  private tokenName(skirmishCharacter: SkirmishCharacter): string {
    return skirmishCharacter.sequenceNumber == 1 ? skirmishCharacter.character.name : skirmishCharacter.character.name + ' ' + skirmishCharacter.sequenceNumber;
  }

  private assignSkirmishCharacterIds(skirmishCharacters: SkirmishCharacter[]) {
    for (const skirmishCharacter of skirmishCharacters) {
      const token = this.tokens.find(token => token.name === this.tokenName(skirmishCharacter));
      if (token) {
        token.skirmishCharacterId = skirmishCharacter.id;
      }
    }
  }

  skirmishCharactersToTokens(skirmishCharacter: SkirmishCharacter) {
    let name = this.tokenName(skirmishCharacter);

    if (!this.tokens.find(token => token.name == name)) {
      let shortName = name.split(' ').map(word => word[0]).join('').toUpperCase()

      this.tokens.push({
        name: name,
        skirmishCharacterId: skirmishCharacter.id,
        shortName: shortName,
        isDead: skirmishCharacter.isDead,
        x: 100, y: 100,
        colorR: skirmishCharacter.skirmishGroup.colorR,
        colorG: skirmishCharacter.skirmishGroup.colorG,
        colorB: skirmishCharacter.skirmishGroup.colorB
      })
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onDrag(event: MouseEvent) {
    if (this.draggedToken) {
      if (Math.hypot(event.clientX - this.dragStartX, event.clientY - this.dragStartY) > 4) {
        this.dragMoved = true;
      }
      const containerRect = this.battlefield.nativeElement.getBoundingClientRect();

      let newX = event.clientX - containerRect.left - this.offsetX;
      let newY = event.clientY - containerRect.top - this.offsetY;

      const maxX = containerRect.width - 40;
      const maxY = containerRect.height - 40;

      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));

      this.draggedToken.x = newX;
      this.draggedToken.y = newY;
    }
  }

  @HostListener('document:mouseup')
  onDrop() {
    localStorage.setItem('battleMapTokens', JSON.stringify(this.tokens))
    this.draggedToken = null;
  }

  onDragStart(event: MouseEvent, token: any) {
    if (event.button !== 0) {
      return;
    }
    this.draggedToken = token;
    this.dragMoved = false;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.offsetX = event.clientX - rect.left;
    this.offsetY = event.clientY - rect.top;
  }

  onTokenClick(event: MouseEvent, clickedToken: Token) {
    event.stopPropagation();
    if (this.dragMoved || clickedToken.isDead) {
      return;
    }
    this.selectedToken = this.selectedToken === clickedToken ? null : clickedToken;
  }

  onMapClick() {
    this.selectedToken = null;
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.selectedToken = null;
  }

  onTokenContextMenu(event: MouseEvent, target: Token) {
    event.preventDefault();
    event.stopPropagation();
    if (this.selectedToken === null || this.selectedToken === target || target.isDead) {
      return;
    }
    this.menuTarget = target;
    const rect = this.battlefield.nativeElement.getBoundingClientRect();
    this.menuPosition = {x: event.clientX - rect.left, y: event.clientY - rect.top};
    this.menuTrigger.openMenu();
  }

  isEngaged(): boolean {
    return !!this.selectedToken && !!this.menuTarget && this.selectedToken.meleeTargetName === this.menuTarget.name;
  }

  onMenuAttack() {
    if (this.selectedToken && this.menuTarget && this.selectedToken.skirmishCharacterId != null
      && this.menuTarget.skirmishCharacterId != null) {
      this.openAttackDialog(this.selectedToken, this.menuTarget);
    }
  }

  onMenuToggleEngage() {
    if (!this.selectedToken || !this.menuTarget) {
      return;
    }
    this.selectedToken.meleeTargetName = this.isEngaged() ? '' : this.menuTarget.name;
    localStorage.setItem('battleMapTokens', JSON.stringify(this.tokens));
  }

  private openAttackDialog(attackerToken: Token, targetToken: Token) {
    const attacker = this.skirmishCharacterService.getSkirmishCharacter(attackerToken.skirmishCharacterId!);
    const target = this.skirmishCharacterService.getSkirmishCharacter(targetToken.skirmishCharacterId!);
    if (!attacker || !target) {
      return;
    }

    const damageDialog = this.dialog.open(ReceiveDamageDialog, {
      width: '860px',
      maxWidth: '95vw',
      data: {target, attacker},
    });
    let isMeleeAttack = false;
    damageDialog.beforeClosed().subscribe(() => isMeleeAttack = damageDialog.componentInstance.isMeleeAttack);
    damageDialog.afterClosed().subscribe(async (receivedDamage: ReceivedDamage | undefined) => {
      if (receivedDamage != undefined) {
        if (isMeleeAttack) {
          attackerToken.meleeTargetName = targetToken.name;
          localStorage.setItem('battleMapTokens', JSON.stringify(this.tokens));
        }
        await this.damageReportService.applyAndReport(receivedDamage, target, attacker);
      }
    });
  }

  toggleLabels(): void {
    this.showLabels = !this.showLabels;
    localStorage.setItem('battleMapLabels', this.showLabels ? 'on' : 'off');
  }

  isLowToken(token: Token): boolean {
    const height = this.battlefield?.nativeElement.clientHeight ?? 600;
    return token.y + 50 + 22 > height;
  }

  getLabelPlacement(token: Token): 'below' | 'above' | null {
    const element = this.battlefield?.nativeElement;
    const width = element?.clientWidth ?? 900;
    const height = element?.clientHeight ?? 600;
    const signature = width + 'x' + height + '|' +
      this.tokens.map(t => `${t.name}:${Math.round(t.x)}:${Math.round(t.y)}:${t.isDead}`).join('|');
    if (signature !== this.labelSignature) {
      this.labelSignature = signature;
      this.layoutLabels(width, height);
    }
    return this.labelPlacements.get(token.name) ?? null;
  }

  isLabelAbove(token: Token): boolean {
    const placement = this.getLabelPlacement(token);
    return placement ? placement === 'above' : this.isLowToken(token);
  }

  private layoutLabels(width: number, height: number): void {
    const discs: Rect[] = this.tokens.map(t => ({x: t.x - 2, y: t.y - 2, w: 54, h: 54}));
    const placed: Rect[] = [];
    const order = [...this.tokens].sort((a, b) => Number(a.isDead) - Number(b.isDead));
    this.labelPlacements.clear();

    for (const token of order) {
      const labelWidth = Math.min(200, token.name.length * 6.4 + 16);
      const labelHeight = 18;
      const left = token.x + 25 - labelWidth / 2;
      const candidates: ['below' | 'above', number][] = [
        ['below', token.y + 53],
        ['above', token.y - 3 - labelHeight]
      ];

      let chosen: 'below' | 'above' | null = null;
      for (const [side, top] of candidates) {
        const rect: Rect = {x: left, y: top, w: labelWidth, h: labelHeight};
        const inside = rect.x >= 0 && rect.y >= 0 && rect.x + rect.w <= width && rect.y + rect.h <= height;
        if (inside && !discs.some(d => this.overlaps(rect, d)) && !placed.some(p => this.overlaps(rect, p))) {
          chosen = side;
          placed.push(rect);
          break;
        }
      }
      this.labelPlacements.set(token.name, chosen);
    }
  }

  private overlaps(a: Rect, b: Rect): boolean {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  getTargetToken(token: Token): Token | undefined {
    return this.tokens.find(t => t.name === token.meleeTargetName);
  }

  getEngagedLineOffset(token: Token, isX: boolean): number {
    const target = this.getTargetToken(token);
    if (!target) return 0;

    const isMutual = target.meleeTargetName === token.name;
    const tokenNameLower = token.name.toLowerCase();
    const targetNameLower = target.name.toLowerCase();

    if (isMutual && tokenNameLower < targetNameLower) {
      return isX ? 10 : -10;
    }

    return 0;
  }
}
