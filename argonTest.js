const argon2 = require("argon2");

async function hashit() {
	let hash;
	const password = "qwerty";
	try {
		hash = await argon2.hash(password);
		console.log(hash);
	} catch (err) {
		console.log("ERROR " + err);
	}
	try {
		if (await argon2.verify(hash, password)) {
			// password matched
			console.log("matched");
		} else {
			console.log("not matched");
		}
	} catch (err) {
		console.log("ERROR " + err);
	}
}

hashit();
