const WHITE = "\x1b[0m";
const RED = "\x1b[31m";
const RED_2 = "\x1b[37m\x1b[41m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const AQUA = "\x1b[36m";

function info(text) {
	console.log(`${WHITE}[${AQUA}!${WHITE}] ${text}`);
}

function warning(text) {
	console.log(`${WHITE}[${YELLOW}!${WHITE}] ${text}`);
}

function error(text) {
	console.log(`${WHITE}[${RED}!${WHITE}] ${text}`);
}

function success(text) {
	console.log(`${WHITE}[${GREEN}!${WHITE}] ${text}`);
}

function critical(text) {
	console.log(`${RED_2}[!]${WHITE} ${text}`);
}

module.exports = { info, warning, error, success, critical };