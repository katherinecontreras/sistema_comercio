// Generador de IDs temporales más pequeños para evitar problemas con PostgreSQL
let idCounter = 1;

export const generateTempId = (): string => {
  return `temp_${idCounter++}`;
};

export const generateTempIdWithPrefix = (prefix: string): string => {
  return `${prefix}_${idCounter++}`;
};
