export const contracts: {[key: number]: string} = {
    1: "Petite",
    2: "Garde",
    4: "Garde sans",
    6: "Garde contre",
};

export const cardPoints: {[key: number]: number} = {
    0: 4.5, 1: 4.5, 21: 4.5,
    111: 1.5, 211: 1.5, 311: 1.5, 411: 1.5,
    112: 2.5, 212: 2.5, 312: 2.5, 412: 2.5,
    113: 3.5, 213: 3.5, 313: 3.5, 413: 3.5,
    114: 4.5, 214: 4.5, 314: 4.5, 414: 4.5
};

export const scoreToWin: {[key: number]: number} = {
    0: 56,
    1: 51,
    2: 41,
    3: 36
};