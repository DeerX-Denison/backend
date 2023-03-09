import { Transaction, WriteBatch } from '../services/firebase';

export interface ModelOptions {
	batch?: WriteBatch;
	transaction?: Transaction;
}
