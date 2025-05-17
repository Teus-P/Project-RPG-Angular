import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {NgClass, NgForOf, NgStyle} from "@angular/common";
import {Subscription} from "rxjs";
import {SkirmishCharacterService} from "../../../core/services/skirmish-character-service/skirmish-character.service";
import {SkirmishCharacter} from "../../../core/model/skirmish/skirmish-character.model";

interface Token {
  name: string;
  shortName: string;
  isDead: boolean;
  x: number;
  y: number;
  colorR: number;
  colorG: number;
  colorB: number;
}

@Component({
  selector: 'app-skirmish-battlefield',
  imports: [
    NgForOf,
    NgStyle,
    NgClass
  ],
  templateUrl: './skirmish-battlefield.component.html',
  styleUrl: './skirmish-battlefield.component.css'
})
export class SkirmishBattlefieldComponent implements OnInit {
  subscription!: Subscription;
  tokens: Token[] = [];

  draggedToken: any = null;
  offsetX = 0;
  offsetY = 0;

  @ViewChild('battlefield', {static: true}) battlefield!: ElementRef<HTMLDivElement>;


  constructor(private skirmishCharacterService: SkirmishCharacterService) {
  }

  ngOnInit(): void {
    if (this.tokens.length == 0) {
      const storedTokensString = localStorage.getItem('battleMapTokens');
      this.tokens = storedTokensString ? JSON.parse(storedTokensString) : []
      if (this.tokens.length == 0) {
        this.skirmishCharacterService.getSkirmishCharacters().forEach(skirmishCharacter => {
          this.skirmishCharactersToTokens(skirmishCharacter)
        })
      }
    }

    this.subscription = this.skirmishCharacterService.skirmishCharactersChanged.subscribe(
      (skirmishCharacters: SkirmishCharacter[]) => {
        const tokensNames = new Set(this.tokens.map(token => token.name));
        const charactersNames = new Set(skirmishCharacters.map(skirmishCharacter => skirmishCharacter.sequenceNumber == 1 ? skirmishCharacter.character.name : skirmishCharacter.character.name + ' ' + skirmishCharacter.sequenceNumber));

        for(const character of skirmishCharacters) {
          let name = character.sequenceNumber == 1 ? character.character.name : character.character.name + ' ' + character.sequenceNumber;
          if(!tokensNames.has(name)) {
            this.skirmishCharactersToTokens(character)
          }
        }

        this.tokens = this.tokens.filter(token => charactersNames.has(token.name))
        localStorage.setItem('battleMapTokens', JSON.stringify(this.tokens))
      }
    )
  }

  skirmishCharactersToTokens(skirmishCharacter: SkirmishCharacter) {
    let name = skirmishCharacter.sequenceNumber == 1 ? skirmishCharacter.character.name : skirmishCharacter.character.name + ' ' + skirmishCharacter.sequenceNumber;

    if (!this.tokens.find(token => token.name == name)) {
      let shortName = name.split(' ').map(word => word[0]).join('').toUpperCase()

      this.tokens.push({
        name: name,
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
    this.draggedToken = token;
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.offsetX = event.clientX - rect.left;
    this.offsetY = event.clientY - rect.top;
  }
}
