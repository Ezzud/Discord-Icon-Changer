const fs = require("fs");
const util = require("util")
const local_appdata = process.env.LOCALAPPDATA;
const readdir = util.promisify(fs.readdir);
const Logger = require("./Logger");
const Config = require("./ConfigManager");
const readline = require('readline').createInterface({
	input: process.stdin,
	output: process.stdout
});
const instanceNames = [
	"Discord",
	"DiscordPTB",
	"DiscordCanary",
	"DiscordDevelopment"
];
const linuxDiscordDirs = [
	"/usr/share",
	"/usr/lib64",
	"/opt",
	"$USER$/.local/share",
	"$USER$/.dvm",
	"/var/lib/flatpak/app",
	"$USER$//.local/share/flatpak/app"
];

async function getNumberArray(min, max) {
	var list = [];
	for (var i = min; i <= max; i++) {
    	list.push(i);
	}
	return list;
}

async function clearConsole() {
	console.clear();
	console.log(`____________________________________________________________________________\n\n	██╗\n	██║\n	██║\n	██║\n	██║con Changer for Discord\n	╚═╝\n`)
	Logger.info(`Author: \x1b[36mhttps://github.com/Ezzud\x1b[0m`);
	Logger.info(`Support: \x1b[36mhttps://discord.ezzud.fr\x1b[0m\n____________________________________________________________________________\n`);
}

async function getInput(allowed_inputs, hideInputs = false, caseSensitive = false) {
	var inputList = "";
	if(allowed_inputs && !hideInputs) {
		inputList += " (";
		for(let i = 0; i < allowed_inputs.length; i++) {
			if(allowed_inputs.length === 1)
				inputList += allowed_inputs[i];
			else
				inputList += allowed_inputs[i];
				if((allowed_inputs.length - 1) !== i) {
					inputList+=", ";
				}
					
		}
		inputList += ")";
	}
	let correctAnswer;
	while(!correctAnswer) {
		var answer = await new Promise(resolve => {
  			readline.question(`${inputList} Select your answer > `, resolve)
		})
		if(caseSensitive) {
			answer = answer.replaceAll(" ", "")
			if(answer.split("")[0] === " ") answer = answer.substring(1);
		} else {
			if(answer.split("")[0] === " ") answer = answer.substring(1);
			answer = answer.toLowerCase();
		}
		if(answer === "cancel") correctAnswer = "cancel";
		else if(allowed_inputs) {
			if(allowed_inputs.find(x => x.toString().toLowerCase() === answer)) {
				correctAnswer = answer;
			} else {
				Logger.error("Invalid Value, please retry.")
			}
		} else {
			correctAnswer = answer;
		}
	}
	return correctAnswer;
}

async function listDir(path) {
  try {
    return await readdir(path)
  } catch (err) {
    Logger.error(err)
  }
}

async function isDirDiscordDir(path) {
	if(await isDirStillExists(path)) {
		var files = await listDir(path);
		if(files.find(x => x.startsWith("app-"))) {
			return true;
		}
	}
	return false;
}

async function getDiscordDirInfo(path, discordType = "Discord") {
	var files = await listDir(path);
	let fixedPath = path;
	if(path.endsWith("\\")) fixedPath = fixedPath.slice(0, -1);
	return { "InstanceName":discordType, "DiscordRoot":fixedPath, "AppRoot":fixedPath + "\\" + files.find(x => x.startsWith("app-")) };
}

async function isDirStillExists(path) {
	return fs.existsSync(path);
}

async function selectCustomInstance() {
	let path = await getInput(undefined, false, true);
	if(await isDirStillExists(path)) {
		if(await isDirDiscordDir(path)) {
			await clearConsole();
			let inf = await getDiscordDirInfo(path);
			await Config.set("workingApp", inf);
			return inf;
		} else {
			await clearConsole();
			Logger.error("Discord Folder is not recognized");
			return undefined;
		}
	} else {
		await clearConsole();
		Logger.error("Path not found");
		return undefined;
	}
	let inf = await getDiscordDirInfo(path);
	await Config.set("workingApp", inf);
	console.log("a")
	return inf;
}

async function startDiscordInstanceSelect() {
	var installedInstances;

	var platform = process.platform;
	if(process.platform === "win32" || process.platform.startsWith("win")) {
		installedInstances = await findInstalledWindowsDiscordInstances();
	} else {
		await clearConsole();
		if(platform === "linux")
			Logger.critical("The Linux compatibility is still in development...");
		else
			Logger.critical("This program is not supporting your Operating System. You can \x1b[31mcontribute to/fork\x1b[0m the project to make it compatible");
		return "error";
	}

	if(installedInstances.length < 1) {
		Logger.warning("No instance of Discord has been found on the default path, please give the path where your Discord is installed\n	Type \"\x1b[33mcancel\x1b[0m\" to cancel");
		Logger.info("Write the path of your Discord below (Example: C:\\Users\\ezzud\\AppData\\Local\\Discord)")
		return(await selectCustomInstance());
	}
	let displayText = `Please select one of the path to customise (1 - ${installedInstances.length})\n`;
	for(let i = 0; i < installedInstances.length; i++) {
		displayText+=` ${(i === (installedInstances.length - 1)) ? `┗` : `┣`} [\x1b[33m${i+1}\x1b[0m] ${installedInstances[i].InstanceName} - ${installedInstances[i].DiscordRoot}`
	}
	displayText+=`\n\n- Type \x1b[33ma number\x1b[0m to select a detected Discord Installation Folder\n- Type \"\x1b[33mcustom\x1b[0m\" to select a custom path	\n- Type \"\x1b[33mcancel\x1b[0m\" to cancel\n`
	Logger.info(displayText);

	let r = await getChoice(installedInstances);
	if(r) {
		await Config.set("workingApp", r);
		return(r);
	}
	return undefined;	

}

async function findInstalledLinuxDiscordInstances() {
	const installedInstances = [];

	for(let i = 0; i < linuxDiscordDirs.length; i++) {
		let dir = linuxDiscordDirs[i];
		if(await isDirStillExists(dir)) {
			// STILL WIP
		} else {continue;}
	}
}

async function findInstalledWindowsDiscordInstances() {
	const installedInstances = [];
	let noFolderCheck = false;

	if(!local_appdata) {
		Logger.error("%LOCALAPPDATA% not found");
    	noFolderCheck = true;
	}

	if(!noFolderCheck) {
		if (!fs.existsSync(local_appdata)) {
	    	Logger.error("Your Local Appdata folder does not exists");
	    	noFolderCheck = true;
		}
		if(!noFolderCheck) {
			for(let i = 0; i < instanceNames.length; i++) {
				let completePath = local_appdata + "\\" + instanceNames[i];
				if (fs.existsSync(completePath)) {
		    		var files = await listDir(completePath);
		    		if(files.find(x => x.startsWith("app-"))) {
		    			installedInstances.push(await getDiscordDirInfo(completePath, instanceNames[i]))
					}
				}
			}	
		}	
	}
	return installedInstances;
}

async function getChoice(installedInstances) {
	// Building choices
	let arr = await getNumberArray(1, installedInstances.length)
	arr.push("cancel");
	arr.push("custom");

	// Get Result
	var num = await getInput(arr);
	if(num === "custom") {
		Logger.info("Write the path of your Discord below (Example: C:\\Users\\ezzud\\AppData\\Local\\Discord)")
		let userPath = await selectCustomInstance();
		return(userPath);
	} else {
		if(num === "cancel") {
			await clearConsole();
			Logger.warning("Selection cancelled");
			return undefined;
		}
		await clearConsole();
		return(installedInstances[parseInt(num) - 1]);
	}
}

module.exports = { startDiscordInstanceSelect, listDir, getInput, isDirStillExists, getNumberArray };