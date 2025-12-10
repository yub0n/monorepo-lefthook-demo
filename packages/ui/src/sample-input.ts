export const INPUT_TYPES = {
  TEXT: 'text',
  PASSWORD: 'password',
  EMAIL: 'email'
} as const;

export type InputType = (typeof INPUT_TYPES)[keyof typeof INPUT_TYPES];

export const isValidInputType = (type: string): type is InputType => {
  return Object.values(INPUT_TYPES).includes(type as InputType);
};
