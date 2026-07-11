import { describe, expect, test } from 'bun:test';

import { focusTextareaAtEnd } from './textarea-caret';

describe('focusTextareaAtEnd', () => {
  test('focuses the textarea and moves the caret to the end of its value', () => {
    let focusOptions: FocusOptions | undefined;
    let selectionStart = -1;
    let selectionEnd = -1;

    const textarea = {
      value: '1 个欧美女大学生和 1 个东亚女大学生',
      focus(options?: FocusOptions) {
        focusOptions = options;
      },
      setSelectionRange(start: number, end: number) {
        selectionStart = start;
        selectionEnd = end;
      },
    } as HTMLTextAreaElement;

    focusTextareaAtEnd(textarea);

    expect(focusOptions).toEqual({ preventScroll: true });
    expect(selectionStart).toBe(textarea.value.length);
    expect(selectionEnd).toBe(textarea.value.length);
  });
});
