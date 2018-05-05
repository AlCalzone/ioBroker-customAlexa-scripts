# ioBroker-customAlexa-scripts
A collection of ioBroker scripts to handle the custom alexa skill

## Installation
Im Skript-Adapter:
* `util_Lights.ts` als `TypeScript` unter `global` einfügen und starten
* `Alexa/Processors_Lights.ts` als `TypeScript` unter `global/Alexa` einfügen und starten
* `AlexaProcessor.ts` als `TypeScript` in einem eigenen Ordner (nicht global!) einfügen und starten

## Benutzung:

> "Alexa, frag ioBroker: *'Sind noch/alle Lichter/Lampen an/aus?'* "  
> \- *Es sind noch 2 Lichter an*
  

## Changelog:

### v0.0.1 (2018-05-05)
* (AlCalzone) Statusabfragen für Lichter