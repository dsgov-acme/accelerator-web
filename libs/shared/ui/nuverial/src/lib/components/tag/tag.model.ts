export interface ITag {
  label: string;
  textColor?: `#${string}` | ITextColors;
  backgroundColor?: `#${string}` | ITextColors;
}

type ITextColors =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'error'
  | 'priority-low'
  | 'priority-medium'
  | 'priority-high'
  | 'priority-urgent'
  | 'white'
  | 'black'
  | 'blue'
  | 'red';
