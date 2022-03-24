export type UserInfo = {
	uid: string;
	email: string | undefined | null;
	photoURL: string | undefined | null;
	displayName: string | undefined | null;
};
// Params/Props types list for tabs and stacks
export type TabsParamList = {
	Listings: undefined;
	Message: undefined;
	Wishlist: undefined;
	Menu: undefined;
	Test: undefined;
};

export type ListingsStackParamList = {
	Main: undefined;
	Create: undefined;
	Edit: { listingId: ListingId };
	MyListing: undefined;
	Item: { listingId: ListingId };
};

export type MessageStackParamList = {
	Threads: undefined;
	Messages: { threadId: ThreadId };
};

export type NewThreadUserInfo = {
	uid: string;
	photoURL: string | undefined | null;
	displayName: string | undefined | null;
};

export type WishlistStackParamList = {
	Main: undefined;
	Item: { listingId: ListingId };
};

export type MenuStackParamList = {
	Main: undefined;
	SignIn: undefined;
};

export type TestStackParamList = {
	Main: undefined;
	Subscription: undefined;
	CardForm: undefined;
	Duc: undefined;
	Khoi: undefined;
	Minh: undefined;
	Messages: { listingId: ListingId };
};

// Listing types
export type ListingId = string;
export type ListingImageURL = string;
export type ListingImageMetadata = {
	uploader: string;
	listingId: string;
	imageId: string;
	resized: string;
	contentValidated: string;
};
export type ListingName = string;
export type ListingPrice = string;
export type ListingCategory =
	| undefined
	| 'FURNITURE'
	| 'FASHION'
	| 'BOOKS'
	| 'SEASONAL'
	| 'DORM GOODS'
	| 'JEWELRIES'
	| 'ELECTRONIC'
	| 'INSTRUMENT';
export type ListingSeller = UserInfo;
export type ListingCondition =
	| undefined
	| 'BRAND NEW'
	| 'LIKE NEW'
	| 'FAIRLY USED'
	| 'USEABLE'
	| 'BARELY FUNCTIONAL';
export type ListingDescription = string;
export type ListingSavedBy = number;
export type ListingStatus = 'posted' | 'saved';

export type ListingData = {
	id: ListingId;
	images: ListingImageURL[];
	name: ListingName;
	price: ListingPrice;
	category: ListingCategory[];
	seller: ListingSeller;
	condition: ListingCondition;
	description: ListingDescription;
	savedBy: number;
	readonly createdAt: FirebaseFirestore.Timestamp | undefined;
	readonly updatedAt: FirebaseFirestore.Timestamp | undefined;
	status: ListingStatus;
};
export type ListingDataCl = ListingData & {
	createdAt: { _seconds: number; _nanoseconds: number };
	updatedAt: { _seconds: number; _nanoseconds: number };
};
export type MyListingData = ListingData;

// app types
export type Selection = {
	id: string;
	text: string;
};

export type CarouselData = string;

export type ThreadId = string;
export type ThreadMembers = UserInfo;
export type ThreadThumbnail = { [uid: string]: string | undefined };
export type ThreadLatestMessages = string | undefined | null;
export type ThreadLatestTime = FirebaseFirestore.Timestamp | undefined | null;
export type ThreadName = { [key: string]: string | undefined };
export type ThreadLatestSenderUid = string | null | undefined;
export type ThreadLatestSeenAt = {
	[uid: string]: FirebaseFirestore.Timestamp | undefined | null;
};
export type ThreadPreviewData = {
	id: ThreadId;
	members: ThreadMembers[];
	membersUid: string[];
	thumbnail: ThreadThumbnail;
	name: ThreadName;
	latestMessage: ThreadLatestMessages;
	latestTime: ThreadLatestTime;
	latestSenderUid: ThreadLatestSenderUid;
	latestSeenAt: ThreadLatestSeenAt;
};
export type ThreadPreviewDataSv = Omit<ThreadPreviewData, 'name'>;

export type MessageId = string;
export type MessageSender = UserInfo;
export type MessageTime = FirebaseFirestore.Timestamp;
export type MessageSeenAt = {
	[key: string]: FirebaseFirestore.Timestamp | null;
};

//add below more further on: image, listing reference, etc.
export type MessageContentType = 'text';
export type MessageContent = string;
export type MessageData = {
	id: MessageId;
	sender: MessageSender;
	time: MessageTime;
	contentType: MessageContentType;
	content: MessageContent;
	membersUid: string[];
	threadName: ThreadName;
	seenAt: MessageSeenAt;
};
export type MessageBlockData = {
	id: MessageId;
	sender: MessageSender;
	time: MessageTime;
	contents: {
		id: MessageId;
		contentType: MessageContentType;
		content: MessageContent;
	}[];
};
export type ThreadData = ThreadPreviewData & {
	messages: MessageData[];
};
export type ThreadDataSv = ThreadData;

export type WishlistDataSV = {
	id: ListingId;
	thumbnail: ListingImageURL;
	name: ListingName;
	price: ListingPrice;
	seller: ListingSeller;
	addedAt: FirebaseFirestore.Timestamp;
};

export type WishlistDataCL = Omit<WishlistDataSV, 'addedAt'>;
export type UserFCMTokenData = {
	token: string;
	device: string;
	updatedAt: FirebaseFirestore.Timestamp;
};
