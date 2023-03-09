import { CloudFunction } from '../../services/cloud-functions';

export const health = CloudFunction.onCall(() => 'ok');
