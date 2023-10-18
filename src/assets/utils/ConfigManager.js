const editJsonFile = require("edit-json-file");
const config = editJsonFile("./config.json", {autosave:true});


async function getConfig() {
	return config;
}

async function set(name, value) {
	await config.set(name, value);
}

async function get(name) {
	return (await config.get(name));
}

async function remove(name) {
	await config.unset(name);
}

module.exports = { getConfig, set, get, remove };