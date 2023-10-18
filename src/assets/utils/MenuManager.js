const { startDiscordInstanceSelect, listDir, isDirStillExists, getNumberArray, getInput } = require("./DiscordInstance");
const { copyFile } = require("fs");
const Logger = require("./Logger");
const Config = require("./ConfigManager");
const assetsFolder = "./src/assets/icons/";
const { exec } = require("child_process");
var icons;

function resetTaskBar() {
	exec("ie4uinit.exe -show", (error, stdout, stderr) => {})
	exec("taskkill /f /im explorer.exe && start explorer.exe", (error, stdout, stderr) => {});
}

async function displayIcons() {
	icons = await listDir(assetsFolder);
	icons = icons.filter(x => x.endsWith(".ico"));

	let finalText = "";
	let counter = 0;
	for(let i = 0; i < icons.length; i++) {
		if(counter === 4) {
			finalText += "\n";
			counter = 0;
		}
		let selectedIcon = await Config.get("selected");
		let fileName = icons[i].split(".")[0];
		let fileLine = `[\x1b[33m${i+1}\x1b[0m] ${fileName.replaceAll("(Zoomed)", "(Zoom)")}`;
		let spaceCount = 38 - fileLine.length;

		if(selectedIcon === fileName) fileLine = `[\x1b[33m${i+1}\x1b[0m] \x1b[32m${fileName}\x1b[0m`;
		if(fileName === "Default") fileLine = `[\x1b[33m${i+1}\x1b[0m] \x1b[36m${fileName}\x1b[0m`;

		finalText += fileLine;
		for(let j = 0; j < spaceCount; j++) {
			finalText += " ";
		}
		counter++;
	}
	finalText += `\n[\x1b[31m?\x1b[0m] Change Discord Path   [\x1b[31mX\x1b[0m] Exit\n`
	console.log(finalText)
}

async function applyIcon(iconSource, iconDestination) {
	await copyFile( iconSource, iconDestination, (err) => {
  		if (err) {
    		Logger.error("Error during applying icon:", err);
  		}
  	});
}

async function clearConsole() {
	console.clear();
	console.log(`____________________________________________________________________________\n\n	██╗\n	██║\n	██║\n	██║\n	██║con Changer for Discord\n	╚═╝\n`)
	Logger.info(`Author: \x1b[36mhttps://github.com/Ezzud\x1b[0m`);
	Logger.info(`Support: \x1b[36mhttps://discord.ezzud.fr\x1b[0m\n____________________________________________________________________________\n`);
}

async function selectIcon(workingApp) {
	let array = await getNumberArray(1, icons.length);
	array.push("?")
	array.push("X")

	let choice = await getInput(array, true);
	if(choice === "x") process.exit(0);
	if(choice === "?") {
		await Config.remove("workingApp");
		await Config.remove("selected");
		clearConsole();
		workingApp = await startDiscordInstanceSelect();
		if(!workingApp) {
			initMenu();
			return;
		}
		if(workingApp === "error") return;
		Logger.success("Defined new Discord Path!")
		initMenu();
		return;
	}

	let icon = icons[parseInt(choice) - 1];
	if(!icon) {
		Logger.error("Icon index not found");
		process.exit(0);
	}
	Logger.info(`Applying Icon \x1b[36m${icon.split(".")[0]}\x1b[0m...`);

	clearConsole();
	await applyIcon(__dirname.replace("utils", "icons") + `\\${icon}`, workingApp.DiscordRoot + `\\app.ico`);
	await applyIcon(__dirname.replace("utils", "icons") + `\\${icon}`, workingApp.AppRoot + `\\app.ico`);
	Logger.success(`Icon \x1b[36m${icon.split(".")[0]}\x1b[0m Successfully applied! Restart your computer for the icon cache to reload`);
	Logger.warning(`Do you want to restart your Taskbar to not have to restart your computer? (y/n)`);

	let all = ["y", "n", "yes", "no"];
	let res = await getInput(all, true);
	clearConsole();
	if(res === "y" || res === "yes") {
		await resetTaskBar();
		Logger.success(`Icon \x1b[36m${icon.split(".")[0]}\x1b[0m Successfully applied!`);
	} else {
		Logger.success(`Icon \x1b[36m${icon.split(".")[0]}\x1b[0m Successfully applied! Restart your computer for the icon cache to reload`);
	}
	await Config.set("selected", icon.split(".")[0]);
	initMenu();
}

async function initMenu() {
	var workingApp;
	if(await Config.get("workingApp")) {
		let c = await Config.get("workingApp");
		if(!await isDirStillExists(c.DiscordRoot) || !await isDirStillExists(c.AppRoot)) {
			Logger.error("Saved Discord Path not found, please select a new one");
			await Config.remove("selected");
			workingApp = await startDiscordInstanceSelect();
			if(!workingApp) {
				initMenu();
				return;
			}
			if(workingApp === "error") return;
		} else {
			workingApp = c;
		}
	} else {
		await Config.remove("selected");
		workingApp = await startDiscordInstanceSelect();
		if(!workingApp) {
			initMenu();
			return;
		}
		if(workingApp === "error") return;
	}
	Logger.info(`Working App: ${workingApp.InstanceName} (${workingApp.DiscordRoot})\n`)
	await displayIcons();
	console.log(`- Type \x1b[33ma number\x1b[0m to select your icon\n- Type \x1b[33m?\x1b[0m to change your working Discord installation\n- Type \x1b[33mX\x1b[0m to exit\n`)
	await selectIcon(workingApp);
}

module.exports = { initMenu, clearConsole };