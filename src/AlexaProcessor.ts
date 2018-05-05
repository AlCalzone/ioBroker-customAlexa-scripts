const namespace = `javascript.${instance}`;
const STATE_ID = `alexaCommand`;

createState(STATE_ID, "", () => {
	// text2command writes the value with ack=false. Change "any" is important too, to process repeated commands.
	on({ id: `${namespace}.${STATE_ID}`, ack: false, change: "any" }, (obj) => {
		const task = JSON.parse(obj.state.val);
		// task looks like
		// {
		//     "command":      "text to process", // command that was received by text2command
		//     "language":     "en",              // language in command or system language
		//     "withLanguage": false              // indicator if language was defined in command (true) or used default language (false)
		// }
		const [command, ...args] = task.command.split(" ");
		const result = processCommand(command, args);
		setState(`${namespace}.${STATE_ID}`, result, true);
	});
});

// ============================

type AlexaCommands = "askDevice" | "directCommand";

function processCommand(command: AlexaCommands, args: string[]): string {
	let ret: string | boolean;
	switch (command) {
		case "askDevice": {
			log(`askDevice: ${args.join(", ")}`);

			if (Alexa.Processors.Lights.isLightStatusQuery(args)) {
				log(`querying lights status...`);
				ret = Alexa.Processors.Lights.processStatusQuery(args);
				log(`==> ${ret}`);
			}
			break;
		}
		case "directCommand": {
			log(`directCommand: ${args.join(", ")}`);

			ret = "Hmm...";
			break;
		}
	}
	if (typeof ret === "undefined") ret = "Das verstehe ich nicht!";
	if (typeof ret === "boolean") ret = ret ? "ja" : "nein";
	return ret;
}
