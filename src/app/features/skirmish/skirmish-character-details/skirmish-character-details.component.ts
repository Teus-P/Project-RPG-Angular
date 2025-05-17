import {Component, HostListener, OnInit} from '@angular/core'
import {SkirmishCharacterService} from "../../../core/services/skirmish-character-service/skirmish-character.service"
import {ActivatedRoute, Params, Router} from "@angular/router"
import {SkirmishCharacter} from "../../../core/model/skirmish/skirmish-character.model"
import {TextResourceService} from "../../../core/services/text-resource-service/text-resource.service";
import {Subscription} from "rxjs";
import {CharacterService} from "../../../core/services/character-service/character.service";

@Component({
  selector: 'app-skirmish-character-details',
  templateUrl: './skirmish-character-details.component.html',
  styleUrls: ['./skirmish-character-details.component.css'],
  standalone: false
})
export class SkirmishCharacterDetailsComponent implements OnInit {

  skirmishCharacter!: SkirmishCharacter
  text = TextResourceService
  skirmishCharacterSubscription!: Subscription
  protected id!: number
  protected characterName!: string;

  constructor(public skirmishCharacterService: SkirmishCharacterService,
              public characterService: CharacterService,
              protected route: ActivatedRoute,
              protected router: Router) {
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
        this.id = +params['id']
        this.skirmishCharacter = this.skirmishCharacterService.getSkirmishCharacter(this.id)

        if (!this.skirmishCharacter.sequenceNumber || this.skirmishCharacter.sequenceNumber === 1) {
          this.characterName = this.skirmishCharacter.character.name
        } else {
          this.characterName = this.skirmishCharacter.character.name + ' ' + this.skirmishCharacter.sequenceNumber;
        }
      }
    )

    this.skirmishCharacterSubscription = this.skirmishCharacterService.skirmishCharactersChanged.subscribe(
      (skirmishCharacters: SkirmishCharacter[]) => {
        let updatedCharacter = skirmishCharacters.find(skirmishCharacter => skirmishCharacter.id == this.skirmishCharacter.id)
        if (updatedCharacter instanceof SkirmishCharacter) {
          this.skirmishCharacter = updatedCharacter
        }
      }
    )

    this.characterService.charactersChanged.subscribe(
      async () => {
        this.skirmishCharacter = await this.skirmishCharacterService.reloadSkirmishCharacter(this.id);
      }
    )
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key == 'Enter') {
      this.onEditCharacter()
    }
  }

  onEditCharacter() {
    this.router.navigate(['edit'], {relativeTo: this.route})
  }
}
