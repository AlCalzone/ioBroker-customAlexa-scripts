// tslint:disable:no-namespace
namespace util {

	export namespace Lights {

		const LIGHT_ENUM_ID = "enum.functions.licht";
		const DIMMER_ROLES = ["level.dimmer", "light.dimmer"];
		const SWITCH_ROLES = ["switch"];

		function isStateObject(obj: iobJS.Object): obj is iobJS.StateObject {
			return obj.type === "state";
		}

		/** Returns an array with all IDs of light states */
		function enumerateLightIDs(): string[] {
			const lightEnum = getEnums().filter(e => e.id === LIGHT_ENUM_ID)[0];
			// light enum was not found
			if (lightEnum == null) {
				log(`The light enum "${LIGHT_ENUM_ID} was not found!`, "warn");
				return [];
			}

			const lightStates = lightEnum.members
				.filter(id => {
					const obj = getObject(id);
					return obj != null && isStateObject(obj);
				});

			return lightStates;
		}

		/** Returns a dictionary of all light IDs, grouped by the deviceID, optionally with dimmers prioritized over switches */
		export function enumerateLights(prioritizeDimmers: boolean = false): Record<string /* device id */, string[]> {
			const lightIDs = enumerateLightIDs();
			const grouped = groupByDeviceID(lightIDs);
			if (prioritizeDimmers) {
				for (const key of Object.keys(grouped)) {
					grouped[key] = doPrioritizeDimmers(grouped[key]);
				}
			}
			return grouped;
		}

		/**
		 * Returns the ioBroker id of the device object for the given state
		 */
		function getDeviceID(stateId: string) {
			const match = /^[^\.]+\.\d+\.[^\.]+/.exec(stateId);
			if (match) return match[0];
		}

		function groupByDeviceID(stateIDs: string[]) {
			const ret: Record<string /* device id */, string[]> = {};
			for (const id of stateIDs) {
				const devID = getDeviceID(id);
				if (devID != null) {
					const arr = ret[devID] || [];
					arr.push(id);
					ret[devID] = arr;
				}
			}
			return ret;
		}

		function doPrioritizeDimmers(stateIDs: string[]) {
			const idAndRoles = stateIDs.map(id => {
				const role = getObject(id).common.role;
				return {
					id,
					isDimmer: DIMMER_ROLES.indexOf(role) > -1,
					isSwitch: SWITCH_ROLES.indexOf(role) > -1,
				};
			});
			const hasDimmers = idAndRoles.find(({ isDimmer }) => isDimmer) != null;
			const hasSwitches = idAndRoles.find(({ isSwitch }) => isSwitch) != null;
			// if there are no mixed roles, just return the original array
			if ((hasDimmers && !hasSwitches) || (hasSwitches && !hasDimmers)) return stateIDs;
			// otherwise only return the dimmers' IDs
			return idAndRoles
				.filter(({ isDimmer }) => isDimmer)
				.map(({ id }) => id)
				;
		}

	}

}
