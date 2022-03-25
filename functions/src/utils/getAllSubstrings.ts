const getAllSubstrings = (str: string | undefined) => {
	const substrings: string[] = [];
	if (str) {
		for (let i = 0; i < str.length; i++) {
			for (let j = i + 1; j < str.length + 1; j++) {
				substrings.push(str.slice(i, j).toLocaleLowerCase());
			}
		}
	}
	return substrings;
};

export default getAllSubstrings;
