import * as React from 'react';
import { ControllerRenderProps } from 'react-hook-form';

import {
  Select as SelectComponent,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField } from '@/types/blocks/form';

export function Select({
  field,
  formField,
  data: _data,
}: {
  field: FormField;
  formField: ControllerRenderProps<Record<string, unknown>, string>;
  data?: Record<string, unknown>;
}) {
  const fieldValue =
    formField.value !== undefined && formField.value !== null
      ? String(formField.value)
      : '';
  const fallbackValue =
    field.value !== undefined && field.value !== null
      ? String(field.value)
      : '';
  const value = fieldValue.trim() ? fieldValue : fallbackValue;

  return (
    <SelectComponent
      value={value}
      onValueChange={formField.onChange}
      {...field.attributes}
    >
      <SelectTrigger className="w-full rounded-md bg-background">
        <SelectValue placeholder={field.placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-md bg-background">
        {field.options?.map((option: { title: string; value: string }) => (
          <SelectItem key={option.value} value={option.value}>
            {option.title}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectComponent>
  );
}
