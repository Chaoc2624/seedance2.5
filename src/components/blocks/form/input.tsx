import { ControllerRenderProps } from 'react-hook-form';

import { Input as InputComponent } from '@/components/ui/input';
import { FormField } from '@/types/blocks/form';

export function Input({
  field,
  formField,
  data: _data,
}: {
  field: FormField;
  formField: ControllerRenderProps<Record<string, unknown>, string>;
  data?: Record<string, unknown>;
}) {
  return (
    <InputComponent
      value={formField.value as string}
      onChange={formField.onChange}
      type={field.type || 'text'}
      placeholder={field.placeholder}
      className="rounded-md bg-background"
      {...field.attributes}
    />
  );
}
