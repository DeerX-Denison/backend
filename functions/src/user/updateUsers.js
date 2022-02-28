/* eslint-disable */
const fs = require('fs/promises');
const users = require('./users.json');

const updateFile = (users) => {
	const emails = [];
	for (const email in users) {
		emails.push(email);
	}

	emails.forEach((email) => {
		let { img } = users[email];
		img = img.replace(/\/s36/g, '/s100');
		img = img.replace(/=s36/g, '=s100');
		users[email]['img'] = img;
	});

	return users;
};

const main = async () => {
	// backup
	await fs.writeFile('./users.json.bak', JSON.stringify(users));

	// update
	const udpatedUsers = updateFile(users);
	await fs.writeFile('./users.json', JSON.stringify(udpatedUsers));
	logger.log('done');
};
main();
