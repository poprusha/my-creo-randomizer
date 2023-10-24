export const getRandomItem = (items) => items[Math.floor(Math.random() * items.length)];

export const randInt = () => Math.floor(Math.random() * 100500000);

export const randIntInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;