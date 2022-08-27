import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import {
	connectAuthEmulator,
	getAuth,
	signInWithEmailAndPassword,
} from 'firebase/auth';
import inquirer from 'inquirer';

dotenv.config();

const firebaseConfig = {
	apiKey: 'AIzaSyDn01yATq7oWgrRNp6zJWZUOE2IUZX0w1k',
	authDomain: 'deerx-dev.firebaseapp.com',
	projectId: 'deerx-dev',
	storageBucket: 'deerx-dev.appspot.com',
	messagingSenderId: '674052514669',
	appId: '1:674052514669:web:456334a83578ca64423064',
	measurementId: 'G-6BMY1HVC4J',
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const { useEmulator } = await inquirer.prompt([
	{ type: 'confirm', name: 'useEmulator', message: 'Connect to emulator?' },
]);

if (useEmulator) {
	connectAuthEmulator(auth, 'http://localhost:9099');
}

const { email, password } = await inquirer.prompt([
	{
		type: 'input',
		name: 'email',
		message: 'Enter tester email',
	},
	{
		type: 'password',
		name: 'password',
		message: 'Enter tester password',
	},
]);

const userCredential = await signInWithEmailAndPassword(
	auth,
	email,
	'welcometoDeerX2022'
);

const idToken = await userCredential.user.getIdToken();

console.log(idToken);
