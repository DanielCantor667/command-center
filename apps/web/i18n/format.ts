/** Fills `{name}` placeholders. Dictionaries cross the server/client boundary, so they hold templates, not functions. */
export const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
