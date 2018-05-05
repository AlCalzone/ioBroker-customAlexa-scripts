// tslint:disable:no-namespace
namespace Alexa.Processors.Lights {

	export type Amount = /*"none" | */"any" | "all";
	const amountWords: Record<string, Amount> = {
		noch: "any",
		// Alexa versteht manchmal "doch" statt "noch"
		doch: "any",
		alle: "all",
		// kein: "none",
		// keine: "none",
	};
	function findAmountInCommand(args: string[]): Amount | undefined {
		for (const word of Object.keys(amountWords)) {
			if (args.indexOf(word) > -1) return amountWords[word];
		}
	}

	export type LightStatus = "on" | "off";
	const statusWords: Record<string, LightStatus> = {
		aus: "off",
		ausgeschaltet: "off",
		an: "on",
		angeschaltet: "on",
	};
	function findStatusInCommand(args: string[]): LightStatus | undefined {
		for (const word of Object.keys(statusWords)) {
			if (args.indexOf(word) > -1) return statusWords[word];
		}
	}

	const triggerWords = ["licht", "lichter", "lampe", "lampen", "leuchten", "leuchte"];
	export function isLightStatusQuery(args: string[]): boolean {
		return args.find(arg => triggerWords.indexOf(arg) > -1) != null;
	}

	export function processStatusQuery(args: string[]): string | boolean {
		const amount = findAmountInCommand(args);
		const status = findStatusInCommand(args);
		if (amount == null || status == null) return;

		const allLights = util.Lights.enumerateLights(true);
		let lightsOn: number = 0;
		let lightsOff: number = 0;
		// iterate over all devices
		for (const device of Object.keys(allLights)) {
			const lightIDs = allLights[device];
			for (const light of lightIDs) {
				const val: number | boolean = getState(light).val;
				const isOn = typeof val === "number" ? val > 0 : val;
				if (isOn) lightsOn++;
				else lightsOff++;
			}
		}

		if ((amount === "any" && status === "on") || (amount === "all" && status === "off")) {
			// sind alle Lichter aus?
			if (lightsOn > 0) return `Es sind noch ${lightsOn} Lichter an.`;
			else return `Alle Lichter sind aus.`;
		} else if (amount === "any" && status === "off") {
			// sind noch Lichter aus?
			if (lightsOff > 0) return `Es sind noch ${lightsOff} Lichter ausgeschaltet.`;
			else return `Alle Lichter sind an.`;
		} else if (amount === "all" && status === "on") {
			// sind alle Lichter an?
			if (lightsOn === 0) return `Alle Lichter sind noch ausgeschaltet`;
			else if (lightsOff > 0) return `Es sind noch ${lightsOff} Lichter ausgeschaltet.`;
			else return `Alle Lichter sind an.`;
		}
	}
}
