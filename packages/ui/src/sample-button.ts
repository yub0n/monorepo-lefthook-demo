export interface ButtonProps {
  label: string;
  onClick: () => void;
}

export const createButton = (props: ButtonProps): string => {
  return `<button onclick="(${props.onClick.toString()})()">${props.label}</button>`;
};

