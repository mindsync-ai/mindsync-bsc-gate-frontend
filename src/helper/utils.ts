export const convertToTitle = (str: string) =>
  (str.charAt(0).toUpperCase() + str.slice(1))
    .replace(/[A-Z]/g, (letter) => ` ${letter}`)
    .trim();

export const minimizeAddress = (address: string, start = 14, end = -11) =>
  `${address.substr(0, start)}...${address.substr(end)}`;

export const sameAddress = (addr1: string, addr2: string) =>
  addr1?.toLowerCase() === addr2?.toLowerCase();
