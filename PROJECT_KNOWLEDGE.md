# Project RPG Angular: baza wiedzy z sesji pracy

Dokument zbiera wszystko, co wiadomo o projekcie, uzgodnienia z użytkownikiem, decyzje projektowe, stan prac i plan dalszych kroków. Przeznaczony dla kolejnych sesji (także dla Claude'a): przeczytaj go na początku pracy. Stan opisany na dzień 2026-10-09 (kroki 1 i 2 refaktoryzacji zrobione), gałąź `feature/libraries-update`.

Treść pochodzi z jednej długiej sesji. To, co zostało zweryfikowane w przeglądarce lub testami, jest oznaczone. Rzeczy niesprawdzone są opisane jako takie.

---

## 1. Czym jest projekt

- Aplikacja webowa do prowadzenia sesji RPG (system wzorowany na Warhammer Fantasy Roleplay: cechy, umiejętności, talenty, stany, zaklęcia, bronie, pancerze, rany, przewagi). Interfejs po polsku.
- Moduły: **Postacie** (lista, szczegóły, edycja, kopiowanie), **Potyczka** (lista postaci w walce, karta postaci, mapa taktyczna), listy referencyjne: **Uzbrojenie**, **Pancerze**, **Zalety i Wady**, **Talenty i Cechy**, **Stany**, **Zaklęcia**.
- Frontend: Angular 19.0.5, Angular Material 19.2.10, Bootstrap 5.3 (CSS i JS), ng-bootstrap 18 (używany tylko do `NgbModal` w `RoundService`), `@angular/flex-layout` 15 beta (przestarzały, 199 użyć `fxLayout`/`fxFlex`), `ngx-color` (selektor koloru), RxJS 7.8, zone.js 0.15, TypeScript 5.6.
- Backend: osobny serwis REST pod `http://localhost:8080` (poza tym repo). Dane są prawdziwymi danymi użytkownika, dlatego testów ani skryptów nie wolno uruchamiać na zapisach/usuwaniu przeciw żywemu backendowi.
- Routing: **hash** (`/#/characters`, `/#/skirmish`, `/#/weapons` itd.). Trasy: `home`, `characters` (`''`, `new`, `:id`, `:id/edit`, `:id/copy`), `skirmish` (`:id`, `:id/edit`), `weapons` (`''`, `:name`), `armors`, `qualities`, `talents_and_traits`, `conditions`, `spells`.
- Dane: przy starcie `AppComponent.fetchData` pobiera 21 zestawów z backendu, zapisuje je w serwisach (listy plus `Subject`) i częściowo w `localStorage` (m.in. `characters`, `skirmishCharacters`, `weapons`, `weaponGroups`, `roundNumber`, `battleMapTokens`, `battleMapLabels`).
- Tłumaczenia: `src/assets/text.json` obsługiwany statycznie przez `TextResourceService.getText()` i `getTranslation(klucz, nazwa)`. Nowe etykiety UI dodaje się jako klucze w `text.json` (klucze w przybliżeniu alfabetycznie).
- Git: gałąź `feature/libraries-update`, główna `develop`, użytkownik git `Teus-P`. Ostatnie commity (od najnowszego): `268c102 refactor: use firstValueFrom, api url from environment and parallel startup fetch, add service tests` (krok 1 plus testy), `f3cf13c feat: UI restyling` (2026-10-07), `22cac8c feat: remove injuries from character creation`, `d200c23 feat: fixes for updated version`, `e307cf5 feat: create a separate module for conditions...`, `7c20a3b feat: libraries update`.

## 2. Uzgodnienia z użytkownikiem (jak pracować)

- Język rozmowy: polski. Zaimków użytkownika nie zgadywać (używać form bezosobowych lub „Ty”).
- **Nie dodawać komentarzy do kodu** (CSS, SCSS, TS, HTML). Kod ma mówić sam za siebie. Istniejące komentarze użytkownika zostawiać. Zasada jest zapisana także w pamięci projektu (`feedback_no-code-comments`).
- Przy zmianach technicznych (refaktoryzacja): małe kroki, dokładny opis co się zmienia i czemu, z elementem nauki (użytkownik chce się przy okazji czegoś nauczyć).
- Przy zmianach wizualnych użytkownik zwykle: opisuje problem lub pomysł, dostaje propozycje, wybiera, ocenia. Lubi wizualne propozycje w narzędziu **lavish** (skill `lavish`, plik `.lavish/theme-proposals.html`, sesja zakończona).
- Nie robić commitów bez prośby. Użytkownik sam zacommitował UI restyling.
- `ng serve` może zostać włączony na porcie 4200. Przy konflikcie portu (`Port 4200 is already in use`) trzeba zabić stary proces, inaczej ogląda się starą wersję.
- Nie zmieniać logiki aplikacji ani danych przy pracach wizualnych. Funkcjonalności (zadawanie obrażeń, dodawanie stanów, panel przewag grupowych itd.) muszą zostać zachowane.
- Użytkownik oceniał zmiany po zrzutach i ręcznie w aplikacji, często zgłaszał drobne poprawki wizualne (szerokości kolumn, wyrównania, czytelność).
- Odpowiadać zwięźle i rzetelnie. Wyraźnie rozróżniać: co sprawdzone (przeglądarka, build, testy), co niesprawdzone.

## 3. System wizualny „Dwór” (wzorowany na Manor Lords)

Użytkownik wybrał kierunek **A · Dwór**: ciemny orzech, antyczne złoto, przygaszona czerwień, panele z cienkimi ramkami, bez zaokrągleń. Karty z danymi są na **pergaminie**.

### Tokeny w `src/styles.css` (`:root`)
```
--rpg-bg #1b1712          --rpg-nav #120f0b        --rpg-panel #2a231a      --rpg-panel-hover #352c20
--rpg-text #cfc3a8        --rpg-text-strong #efe3c2 --rpg-muted #9a8e74
--rpg-gold #c9a255        --rpg-gold-dim #7d6636
--rpg-line #3d3426        --rpg-line-strong #5a4a30 --rpg-blood #a8473a
--rpg-ink #3b2d1d         --rpg-ink-strong #24190f  --rpg-ink-muted #6f5c42  --rpg-lak #7a241c
--rpg-heraldic-filter saturate(.55) sepia(.3) brightness(.82)
--rpg-font-head 'Cinzel'  --rpg-font-body 'EB Garamond'
```

### Czcionki
- **Cinzel**: nagłówki, przyciski, etykiety, nagłówki tabel (wersaliki z odstępami).
- **Cinzel Decorative**: nagłówki sekcji `h4` (Opis, Kategoria, Ciało...), 16 px, bez linii za napisem (linia została celowo usunięta, bo zlewała się z liniami tabel).
- **EB Garamond**: treść. Wszystkie obsługują polskie znaki (sprawdzone).
- Ładowane z Google Fonts w `src/index.html`.

### Motyw Angular Material (`src/my-theme.scss`)
- Własne palety `$gold-palette`, `$bronze-palette`, `$blood-palette` (M2: `mat.m2-define-palette`), ciemny motyw M2 `m2-define-dark-theme`, konfiguracja typografii, powierzchnie nadpisane przez `map.deep-merge` (tło, karta, dialog, hover, tekst, dzielniki).
- Używa API **M2** (Material 19 ma już M3). Migracja na M3 to osobne, większe zadanie.
- Usunięto zakomentowane stare palety (zielona, jasnozielona, pomarańczowa, ciemnopomarańczowa), które były w oryginalnym pliku.

### Pergamin (`.parchment` w `styles.css`)
- `::before`: warstwowe gradienty, szum SVG (`feTurbulence`), przyciemnione brzegi (`inset box-shadow`), `filter: url(#rough) drop-shadow(...)`. Filtr `#rough` (`feTurbulence` plus dwa `feDisplacementMap`) jest wbudowany w `index.html`.
- Wewnątrz `.parchment` zmieniane są zmienne (`--rpg-text-strong`, `--rpg-gold` → atrament i czerwień laku `--rpg-lak`), tabele Material są przezroczyste, nagłówki w czerwieni laku, przyciski w czerwieni laku.
- „Zawinięty róg” (trójkąt w prawym dolnym rogu) został **usunięty** na prośbę użytkownika.
- `.parchment-narrow`: `max-width: 1010px`, wyśrodkowany. Użyty w widokach list z jedną kolumną treści (zalety i wady, talenty i cechy, stany, zaklęcia). W `item-list.component.html` tabela ma `fxFlex="100"`.
- Gdzie jest użyty: karta postaci w widoku postaci i w potyczce, `weapon-group-item-list` (tytuł plus wszystkie tabele grup), `armor-group-item-list`, listy zalet, talentów, stanów, zaklęć. Filtr, przyciski dodawania i lista typów po lewej zostają na ciemnym tle.
- Przyciski `+`/`−` na pergaminie (`.parchment .mat-mdc-mini-fab`) i przełącznik `mat-button-toggle` (Żyje: Tak/Nie, zaznaczona strona w czerwieni laku) mają osobne style.
- **Wysuwany opis (bottom sheet)**: `.bottom-sheet .mat-bottom-sheet-container` ma papier w `::before` sięgający 80 px poniżej dolnej krawędzi okna, więc postrzępiony dół nie jest widoczny. Wnętrze przewija się do 55vh.

### Globalne style
- Przyciski kwadratowe, 40 px, bez zawijania tekstu (`white-space: nowrap`). Wyrównanie „Edytuj” i „X” w formularzach (`form ... margin-top: 8px`).
- Paski przewijania w złocie (webkit i `scrollbar-color` dla Firefoksa).
- Menu, dialogi, panele selectów: cienka ramka, bez zaokrągleń.
- `.list-group-item-text` (opisy na kafelkach): `#bfb396`, kursywa.

### Kolory grup (z backendu)
Kolory RGB grup w potyczce pochodzą z danych. Przygaszane filtrem `--rpg-heraldic-filter` na kwadraciku grupy, pasku kafelka i żetonach. Nowe grupy dostają losowy kolor z palety ośmiu heraldycznych: burgund `#8a2f25`, błękit `#2f4f7a`, oliwka `#5b6b34`, ochra `#b08a3a`, fiolet `#5d3a6b`, morski `#2f6b66`, brąz `#6b4a2b`, szary `#6b665c`. Selektor koloru (`ngx-color`) jest ciemny, wyśrodkowany, z ukrytą przezroczystością.

## 4. Zmiany w poszczególnych widokach

### Potyczka: kafelek postaci (`skirmish-character-item`)
- Pasek żywotności jako **segmenty**: jeden segment na każdą ranę. Odstęp między segmentami maleje z liczbą ran (2 px do 20 ran, 0 px od ok. 87), powyżej 40 ran segmenty tracą ramkę. Zwykły pasek został usunięty z kodu (użytkownik wybrał same segmenty).
- Kolor segmentów: burgund `(138,47,37)` → ochra `(176,138,58)` → oliwka `(107,124,62)`, liczony z procentu życia (`getHealthColor`).
- „Żywotność” stoi przed „Inicjatywą”. Ikony stanów zostały przeniesione pod pasek życia (`.conditions-row`, zawijają się do nowej linii, kafelek się nie poszerza). Etykieta „Stany” tylko gdy są stany.
- Martwa postać: treść wygaszona (rozmycie plus szarość plus przezroczystość), pasek drużyny po lewej zostaje ostry i kolorowy (użytkownik chciał zachować informację o drużynie).
- Panel „Przewagi grupowe” bez wyróżniającego tła.
- Nagłówek karty postaci: przyciski `+`/`−` mają prawdziwy minus „−” (U+2212).

### Karta postaci (`details-*`)
- „Kategoria”, „Frakcja”, „Status” w jednej linii (`.meta-row`, zawija się na wąskim ekranie).
- Umiejętności, talenty, cechy postaci i zaklęcia obok siebie w siatce (`.columns-row`, `repeat(auto-fit, minmax(230px, 1fr))`). Zaklęcia zagęszczone (`.spells-table`, wiersze 30 px, linia tylko pod nazwą grupy).
- Tabela „Ciało”: wiersze 36 px, kolumna „Urazy” ukryta, gdy żadna lokalizacja nie ma urazów (getter z dwiema stałymi tablicami kolumn, żeby nie powodować odbudowy nagłówka).
- Na pergaminie przyciski `+`/`−` i przełącznik Żyje mają własne style (patrz wyżej).

### Pancerze (tabela)
Szerokości kolumn (w %): nazwa 14, cena 8, obc 5, dostępność 10, kategoria 10, lokalizacja 12, punkty pancerza 7, kara 15, zalety i wady 19. Elementy list w kolumnach lokalizacja, kara i zalety nie zawijają się. Nagłówek „Punkty Pancerza” nadal zawija się do dwóch linii (kolumna ok. 100 px). Użytkownik o to nie prosił.

### Okno „Dodaj do walki” (`add-to-fight-dialog`)
- Pole liczby postaci: natywne strzałki ukryte, własne przyciski − i + (`changeNumber`, minimum 1).
- Selektor koloru jak wyżej.

### Widok postaci (lista po lewej)
Kafelek `character-item`: `height: auto`, min. 72 px, tekst nie jest przycinany.

### Listy (filtr)
`app-list-filter`: pole ma stałą szerokość 220 px (`.filter-box`). Wcześniej wystawało i dawało 9 px poziomego przepełnienia całej strony.

### Ikony stanów (`src/assets/icons`)
Wygenerowano 12 nowych ikon (SVG w `src/assets/icons/svg/`, renderowane do PNG 256 × 256, kreska złota `#d9b86a`), stare PNG zostawione jako `*_old.png`. Mapowanie: ABLAZE płomień, BLEEDING kropla, BLINDED przekreślone oko, BROKEN pęknięta tarcza, DEAFENED przekreślone ucho, ENTANGLED pajęczyna, FATIGUED klepsydra, POISON kolba, PRONE strzałka w dół nad linią podłoża, STUNNED trzy gwiazdki, SURPRISED wykrzyknik w kółku, UNCONSCIOUS księżyc z „z”. Interpretacje ikon są autorskie. Aplikacja wyświetla je w 25 px (tego rozmiaru w aplikacji nie weryfikowano wizualnie dla wszystkich).

### Mapa (zakładka „Mapa” w potyczce, `skirmish-battlefield`)
- Tło: postarzony pergamin (gradienty, plamy, szum, ciemne brzegi, cienka podwójna ramka kartograficzna). **Bez siatki**: użytkownik odłożył temat siatki i liczenia odległości na później.
- Żetony jak pieczęcie: połysk, złoty pierścień, ciemna obwódka, inicjały w Cinzel. Struktura: `.token-holder` (pozycja, zdarzenia) zawiera `.token` (dysk, kolor drużyny) i `.token-name` (podpis). Przeciąganie używa `event.currentTarget`.
- Zaznaczony żeton (Shift + klik, tryb walki w zwarciu): złoty pierścień z poświatą (`.token-holder.clicked::before`). Martwy: szarość plus cienki ciemny krzyżyk.
- Podpisy z imionami: układane algorytmem unikania kolizji (`layoutLabels`: pod lub nad żetonem, nie mogą zachodzić na żadne żetony ani inne podpisy ani wychodzić poza mapę; żywe postacie mają pierwszeństwo; gdy brak miejsca, podpis widać tylko po najechaniu). Przycisk „Podpisy” (prawy górny róg mapy) włącza i wyłącza stałe podpisy (zapamiętane w `localStorage`: `battleMapLabels`).
- Wysokość mapy: `calc(100vh - 140px)`, minimum 420 px. Gdy aktywna jest zakładka „Mapa”, prawa kolumna (zakładki plus mapa) jest `position: sticky` (`.sticky-map`, `isMapTabActive`), więc zostaje na ekranie przy przewijaniu listy postaci. W zakładce „Postać” kolumna nie jest przyklejona, bo karta jest dłuższa niż ekran.
- Zakładki są przetłumaczone: `characterLabel` = „Postać”, `mapLabel` = „Mapa”, `labelsLabel` = „Podpisy” (dodane do `text.json`).
- Wszystkie żetony domyślnie startują w tym samym miejscu (ok. 100, 100 px), dopóki nie zostaną przesunięte. Zaproponowano rozkładanie ich w siatce lub wg drużyn. **Czekamy na decyzję** (to zmiana zachowania, nie wyglądu).

### Znane ostrzeżenie
`ng build` (produkcyjny) pokazuje ostrzeżenie budżetu stylu komponentu `skirmish-battlefield.component.css`: 4,03 kB przy limicie ostrzeżenia 2 kB. Limit błędu (`anyComponentStyle`) to 4 kB (4096 B), więc zapas jest minimalny. Kolejne style w tym pliku mogą zepsuć build produkcyjny. Do rozwiązania osobno (przenieść część stylów lub podnieść limit w `angular.json`).

## 5. Refaktoryzacja techniczna

### Przegląd kodu (stan wyjściowy)
Dobre: `strict: true`, `strictTemplates`, builder `application`. Wskazane problemy (statystyki z grep):
1. `@angular/flex-layout` (199 użyć) jest nieutrzymywany, wersja `15.0.0-beta.42` przy Angularze 19 (niezgodne peer dependencies, `Dockerfile` używa `npm install --force`).
2. `.toPromise()`: 38 użyć (przestarzałe w RxJS 7). **Naprawione w kroku 1.**
3. 27 `.subscribe`, 0 `unsubscribe`/`takeUntil`/`takeUntilDestroyed` (np. `details-body-localizations` subskrybuje `charactersChanged` w `ngOnInit` bez sprzątania).
4. Adres `http://localhost:8080` wpisany na sztywno 37 razy. **Naprawione w kroku 1.**
5. Start pobierał 21 zestawów sekwencyjnie. **Naprawione w kroku 1.**
6. Metody w szablonach (`getSkillsList`, `createListOfSpells`, `calculateWeaponDamage`, 6 miejsc). `createListOfSpells` **sortuje przekazaną tablicę w miejscu** (`spells.sort`) i tworzy nową tablicę przy każdym cyklu wykrywania zmian.
7. Brak obsługi błędów HTTP w odczytanych serwisach (brak `try/catch`/`catchError`). Przy padniętym backendzie ekran ładowania nie znika.
8. 56 komponentów `standalone: false`, `app.module.ts` 161 linii, start przez `platformBrowserDynamic().bootstrapModule`.
9. Stara składnia szablonów: 76 `*ngIf`, 56 `*ngFor` wobec 2 `@if`, 6 `@for`. 3 użycia `trackBy`.
10. 93 konstruktory, 0 `inject()`. `AppComponent` wstrzykuje 13 serwisów jako `public`.
11. 0 użyć `signal`/`computed`/`input()`/`output()`, 0 `OnPush`.
12. Trzy biblioteki UI naraz (Material, Bootstrap CSS i JS plus popper, ng-bootstrap tylko dla `NgbModal`). 27 klas Bootstrapa w szablonach.
13. TSLint (wycofany) plus `tslint-angular`. Docelowo ESLint z `angular-eslint`.
14. Pozostałości: `polyfills.ts`, `test.ts`, `NODE_OPTIONS=--openssl-legacy-provider` w skrypcie `build`.
15. `tsconfig.json`: `moduleResolution: node`, `module: es2020`, `lib: es2018` przy `target: ES2022`.
16. `Dockerfile`: `node:latest`, `nginx:latest`, `npm install --force`, `npm run build --prod`.
17. Testy: 13 szkieletów „should create” (część padała).
18. Motyw Material w API M2.

Drobne: kilkanaście komponentów ma identyczne pliki CSS, `character-edit.component.ts` 385 linii, `translate.service.ts` 194 linie, odczyt `localStorage` w 26 miejscach z `JSON.parse(<string>…)`, 14 użyć `any`.

### Uzgodniona kolejność (małymi krokami)
1. **Krok 1 (ZROBIONY, commit `268c102`)**: `toPromise` → `firstValueFrom`, adres API do `environment`, równoległy start danych.
2. **Krok 2 (ZROBIONY, niezacommitowany)**: sprzątanie subskrypcji (`takeUntilDestroyed`) i zastąpienie `createListOfSpells` czystym pipe'em `spellRows` (patrz niżej).
3. Krok 3: automatyczne migracje Angulara: control flow (`ng generate @angular/core:control-flow`), `inject()` (`:inject`), standalone (`:standalone`), ewentualnie sygnałowe inputy (`:signal-inputs`). Każda wymaga builda i testów.
4. Krok 4: wymiana `@angular/flex-layout` na CSS flex/grid, porządki w konfiguracji (ESLint, `tsconfig`, `Dockerfile`, usunięcie `polyfills.ts`/`test.ts`/flagi openssl).
5. Krok 5: sygnały, OnPush, ewentualna migracja na M3.
- Osobno do zrobienia: obsługa błędów HTTP (punkt 7), budżet CSS mapy.

### Krok 2: szczegóły
- **Subskrypcje:** żaden komponent nie implementował `OnDestroy`, więc 9 subskrypcji na długo żyjących `Subject` serwisów wyciekało (część komponentów trzymała `Subscription` w polu, ale nikt jej nie anulował). Naprawione w 7 komponentach (`armor-group-item-list`, `weapon-type-list`, `character-list`, `skirmish-characters-list` (2), `skirmish-character-details` (2), `skirmish-battlefield`, `details-body-localizations`) wzorcem `private destroyRef = inject(DestroyRef)` plus `.pipe(takeUntilDestroyed(this.destroyRef))`. Usunięto pola `subscription` i nieużywane importy `Subscription`. Subskrypcje `dialogRef.afterClosed()` (kończą się same) i `route.params`/`queryParams` (sprząta router) nie wymagały zmian.
- **`createListOfSpells` → pipe `spellRows`** (`src/app/shared/pipes/spell-rows.pipe.ts`, standalone, zarejestrowany w `imports` modułu `AppModule`): metoda w szablonie sortowała tablicę `character.spells` w miejscu i zwracała nową tablicę przy każdym cyklu wykrywania zmian (tabela Material odbudowywała wiersze). Pipe jest czysty (przelicza się tylko przy zmianie referencji tablicy) i nie mutuje wejścia (`[...spells].sort`). Interfejs `Group` zastąpiony `SpellGroupRow`. Zmiana zachowania: kolejność `character.spells` nie jest już zmieniana jako efekt uboczny wyświetlenia.
- **`getSkillsList`/`getTalentsList`:** metody modelu są poprawne (czyste funkcje), problemem było wołanie ich z szablonu (przy włączonym filtrze potyczkowym `filter()` zwracał nową tablicę przy każdym cyklu, dwukrotnie na tabelę). Szablon używa teraz czystych pipe'ów `skillsList` i `talentsList` (`character | skillsList: skillsCheckbox`, pliki `shared/pipes/skills-list.pipe.ts`, `talents-list.pipe.ts`, zarejestrowane w `AppModule`), które delegują do metod modelu. Test `details-character.component.spec.ts` sprawdza, że tabele dostają tę samą tablicę w kolejnych cyklach (po cofnięciu zmiany padają).
- Testy: `shared/pipes/spell-rows.pipe.spec.ts` (7) i `subscription-cleanup.spec.ts` (7 komponentów × 3 przypadki, sprawdza `Subject.observed` po `fixture.destroy()`). Test mutacyjny: usunięcie `takeUntilDestroyed` z dwóch komponentów i kopii w pipe powaliło 5 testów.

### Krok 1: szczegóły
- **1a**: `x.toPromise()` → `firstValueFrom(x)` w 15 serwisach (35 miejsc przez skrypt plus 3 ręcznie: `fetchArmors` z `pipe(tap)`, `storeArmor`, `testRolls`). Usunięto 12 bezużytecznych `.then()` bez argumentów. Różnica semantyczna: przy strumieniu bez wartości `firstValueFrom` rzuca `EmptyError` (`toPromise` zwracało `undefined`). Dla `HttpClient` (zawsze jedna emisja, także `null`) i `afterClosed()` to bezpieczne.
- **1b**: `environment.apiUrl = 'http://localhost:8080'` w `environment.ts` i `environment.prod.ts`. Wszystkie serwisy używają `` `${environment.apiUrl}/…` ``. Przed prawdziwym wdrożeniem ustawić właściwy adres w `environment.prod.ts`. Alternatywa na później: interceptor HTTP doklejający adres.
- **1c**: `AppComponent.fetchData` używa `Promise.all([...])` dla 21 niezależnych pobrań (sprawdzono: każde czyta backend, tłumaczy z lokalnego `text.json` i zapisuje do własnej listy, bez zależności między nimi). Pomiar (lokalny backend, orientacyjny): 1016 ms sekwencyjnie wobec 346 ms równolegle. Zachowanie błędów bez zmian: pierwszy błąd odrzuca `Promise.all`, loader zostaje.
- Sprawdzone w przeglądarce: tylko odczyty (GET). Zapisy (POST/PUT/DELETE) przetestowane wyłącznie testami z mockami.

## 6. Testy

- Uruchamianie bez okna przeglądarki: `CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npx ng test --watch=false --browsers=ChromeHeadless`. `karma.conf.js` ma `browsers: ['Chrome']` (otwiera okno). Konfiguracji nie zmieniano.
- Stan: **152 testy przechodzą, 5 pada** (po kroku 2 i poprawce `getSkillsList`/`getTalentsList`). Pięć padających to istniejące szkielety „should create” komponentów edycji (`CharacteristicsEdit`, `ConditionsEdit`, `NotesEdit`, `SpellsEdit`, `WeaponsEdit`): oczekują od rodzica `FormGroup` (`Cannot read properties of undefined (reading 'get')`). Plików nie ruszano.
- Dodane testy (110 przechodzi): `app.component.spec.ts` (równoległy start, loader do końca najwolniejszego, błąd jednego zapytania), `base.service.spec.ts`, `character.service.spec.ts`, `skirmish.service.spec.ts`, `armor.service.spec.ts`, `weapon.service.spec.ts`, `skirmish-character.service.spec.ts`, `round.service.spec.ts` (zastąpił szkielet), oraz testy pobierania list dla `Talent`, `Spell`, `Trait`, `Skill` (zastąpiły szkielety), `Condition`, `Injury`, `BodyLocalization`, `Availability`.
- Wspólny pomocnik: `src/app/core/testing/list-fetcher-testing.ts` (`describeListFetcher`, `createTranslateServiceMock`, `fakeTranslations`). Każdy prosty serwis ma tylko konfigurację przypadku.
- Technika: `provideHttpClientTesting()` plus `HttpTestingController` (`expectOne`, `flush`, `verify`), `jasmine.createSpyObj` dla `TranslateService`, `spyOn` statycznych metod (`TextResourceService.getTranslation`, `Character.fromJSON`), ręcznie sterowane Promise (`deferred`) do testu równoległości, `waitForNextRequest` (`setTimeout`), bo drugie zapytanie serwisu idzie dopiero po zakończeniu pierwszego.
- Test mutacyjny: po przywróceniu sekwencyjnego startu i zmianie adresu `/talent` → `/talents` padło 7 z 8 uruchomionych testów (oryginał przywrócono).
- Ograniczenia: dane odpowiedzi to ręcznie zbudowane przykłady (nie weryfikują zgodności z prawdziwym API). Brak testów komponentów i wyglądu.

## 7. Stan repozytorium (2026-10-09)

- Zacommitowane: `f3cf13c feat: UI restyling` (UI) oraz `268c102 refactor: ...` (krok 1 plus testy serwisów i `AppComponent`, pomocnik `core/testing`).
- **Niezacommitowane (krok 2)**: 7 komponentów z `takeUntilDestroyed`, `details-character` (pipe `spellRows` zamiast `createListOfSpells`), `app.module.ts`, nowe pliki `src/app/shared/pipes/*`, `src/app/subscription-cleanup.spec.ts`, ten plik (`PROJECT_KNOWLEDGE.md`).
- Nadal niewersjonowane: `src/assets/icons/svg/`, `src/assets/icons/*_old.png`, `.lavish/`, `.angular/`.
- `package-lock.json` miał zmiany wprowadzone przez użytkownika przy aktualizacji bibliotek (stan początkowy sesji).
- Proponowany podział commitu dla kroku 2: `refactor: release service subscriptions with takeUntilDestroyed and replace createListOfSpells with a pure pipe`.

## 8. Rzeczy otwarte i decyzje do podjęcia

- Zacommitować krok 2 (propozycja wiadomości w sekcji 7).
- Krok 3 refaktoryzacji (automatyczne migracje: control flow, `inject()`, standalone).
- Naprawa 5 padających szkieletów komponentów edycji (podanie `FormGroup`) i/lub launcher headless w `karma.conf.js`.
- Ustawić prawdziwy `apiUrl` w `environment.prod.ts` przed wdrożeniem.
- Mapa: rozkładanie nowych żetonów (siatka lub wg drużyn), siatka i liczenie odległości (odłożone), ewentualne skracanie podpisów.
- Budżet CSS komponentu mapy (4,03 kB przy limicie błędu 4 kB).
- Nagłówek „Punkty Pancerza” w jednej linii (opcjonalnie).
- Migracja motywu Material na M3 (późny krok).
- Dodać `.lavish/`, `.angular/` do `.gitignore`.

## 9. Pułapki i wskazówki praktyczne

- Routing jest **hashowy**: linki `/#/…`, w testach przeglądarkowych klikać `nav a[href="#/skirmish"]` zamiast wchodzić na ścieżkę.
- Na macOS `sed -i` wymaga argumentu (`sed -i ''`), w zsh nieopakowane `--include=*.html` w `grep` powoduje błąd globbingu. Do edycji wielu plików wygodniej używać skryptów Pythona.
- Zrzuty ekranu do weryfikacji wizualnej: Chrome w trybie headless sterowany przez protokół DevTools (CDP) z własnego skryptu w `/tmp` (nietrwały). Przed każdym uruchomieniem ubić `remote-debugging-port` i usunąć profil. Zwykłe `--screenshot` robi zrzut za wcześnie (aplikacja ładuje 21 zapytań), CDP pozwala poczekać i wykonać JS w stronie.
- W Materialu zmienne motywu przełącznika zależą od `appearance` (używany `legacy`), więc trzeba nadpisywać zmienne `--mat-legacy-button-toggle-*` oraz `--mat-standard-button-toggle-*`.
- Filtr `#rough` na `::before` jest kosztowny dla bardzo wysokich elementów. Arkusze talentów (ok. 51 000 px) i zaklęć (ok. 45 000 px) renderują się poprawnie, ale płynności przewijania nie mierzono. Gdyby było przycinanie, podzielić na osobne arkusze (np. po grupie).
- `ng build` bez konfiguracji jest produkcyjny (ostrzeżenie budżetu). `ng build --configuration development` to szybki sprawdzian poprawności.
- Pierwszy problem sesji: `ERR_MODULE_NOT_FOUND` dla `@angular/compiler/fesm2022/compiler.mjs` wynikał z uszkodzonej instalacji `node_modules` po aktualizacji. Rozwiązanie użytkownika: przeinstalowanie (`rm -rf node_modules && npm ci`).

## 10. Mapa ważniejszych plików

- Motyw i style globalne: `src/styles.css`, `src/my-theme.scss`, `src/index.html` (czcionki, filtr `#rough`).
- Teksty: `src/assets/text.json`, `src/app/core/services/text-resource-service/text-resource.service.ts`.
- Serwisy danych: `src/app/core/services/*` (każdy z `fetchX`, listą i `Subject`), `base.service.ts` (wspólne `fetchMethod`), `translate.service.ts`.
- Start danych: `src/app/app.component.ts` (`fetchData`).
- Potyczka: `src/app/features/skirmish/` (`skirmish.component.*` zakładki i sticky mapy, `skirmish-characters-list/…/skirmish-character-item/*` kafelek, `skirmish-battlefield/*` mapa).
- Szczegóły postaci: `src/app/shared/components/details-components/*` (`details-character`, `details-descriptions`, `details-body-localizations`, `details-conditions`).
- Listy referencyjne: `src/app/features/list-of-elements/*`, wspólny `src/app/shared/components/item-list`, filtr `src/app/shared/components/list-filter`.
- Dialogi: `src/app/features/character/character-list/add-to-fight-dialog`, `src/app/shared/components/dialog-window/*`, opis wysuwany `src/app/shared/components/bottom-sheet`.
- Testy: pliki `*.spec.ts` obok kodu, pomocnik `src/app/core/testing/list-fetcher-testing.ts`.
- Konfiguracja: `angular.json` (budżety, builder), `tsconfig*.json`, `karma.conf.js`, `Dockerfile`, `nginx.conf`.
