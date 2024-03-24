// file: /src/utils/Meta.ts



export function getContextName(context?: Function|null): string {

	// Types could be one of the following:
	// "get "
	// "set "
	// "bound "
	// "function "
	// "class "
	// "async "
	// not handling "generator " or "async generator " for now

	const maybeName: string = (context === null) ? arguments.callee.caller.name : context?.name || context?.constructor?.name || context?.toString() || "";
	let contextName: string = "anonymous";
	let contextType: string = "anonymous";
	
	if (!((maybeName === undefined) || (maybeName === null) || (maybeName === ""))) {

		const name = String(maybeName || "");
		const space = String(name || "").indexOf(" ");

		if (space > 0) {
			contextType = name.substring(0, space);
			contextName = name.substring(space + 1);
		}

	}

	return `${contextType}::${contextName}`;
}

