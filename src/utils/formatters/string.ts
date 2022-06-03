export const truncateAddress = (address: string, first = 5, last = 5) =>
    address ? `${address.slice(0, first)}...${address.slice(-last, address.length)}` : null;

export const truncateText = (text: string, maxLength: number) =>
    text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

export const fixDuplicatedTeamName = (name: string) => {
    const middle = Math.floor(name.length / 2);
    const firstHalf = name.substring(0, middle).trim();
    const secondHalf = name.substring(middle, name.length).trim();
    if (firstHalf === secondHalf) {
        return firstHalf;
    }
    return name;
};
