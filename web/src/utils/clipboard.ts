export async function copyToClipboard(text: string): Promise<boolean> {
	if (!text) return false;

	if (navigator.clipboard?.writeText) {
		try {
			await navigator.clipboard.writeText(text);
			return true;
		} catch {
			// fiveM nui/cef can expose navigator.clipboard but reject writes.
		}
	}

	const textarea = document.createElement("textarea");
	textarea.value = text;
	textarea.setAttribute("readonly", "true");
	textarea.style.position = "fixed";
	textarea.style.opacity = "0";
	textarea.style.pointerEvents = "none";
	document.body.appendChild(textarea);

	try {
		textarea.select();
		textarea.setSelectionRange(0, text.length);
		return document.execCommand("copy");
	} catch {
		return false;
	} finally {
		document.body.removeChild(textarea);
	}
}