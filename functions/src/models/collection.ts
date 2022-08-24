export enum Collection {
	// collection to store user data
	'users' = 'users',

	// collection to store room data
	'rooms' = 'rooms',

	// collection to store chat messages
	'messages' = 'messages',

	// collection to store user fcm tokens
	'fcmTokens' = 'fcmTokens',

	// collection to store all error while invoking functions
	'errors' = 'errors',

	// collection of followers the current user has
	'followers' = 'followers',

	// collection of users the current user is following
	'following' = 'following',

	// collection of requests by want-to-be followers
	'followerRequests' = 'followerRequests',

	// collection of requests by current user
	'followingRequests' = 'followingRequests',
}
