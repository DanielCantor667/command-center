import { useId } from 'react';
import { Stack } from '@command-center/ui';
import { MILESTONE_FILTER_OPTIONS } from '../../../../data/mission-log';

export interface MissionFiltersState {
  architecture: string;
  technology: string;
  year: string;
  project: string;
}

interface FiltersProps {
  filters: MissionFiltersState;
  onChange: (filters: MissionFiltersState) => void;
}

function SelectFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  const id = useId();

  return (
    <Stack direction="vertical" gap="xs">
      <label htmlFor={id} className="text-body-small font-sans text-text-muted">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-surface-secondary text-text-primary border border-panel-border rounded-md px-3 py-2 text-body font-sans"
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </Stack>
  );
}

export function Filters({ filters, onChange }: FiltersProps) {
  const update = (key: keyof MissionFiltersState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <Stack direction="horizontal" gap="md" wrap>
      <SelectFilter
        label="Year"
        value={filters.year}
        options={MILESTONE_FILTER_OPTIONS.years}
        onChange={(v) => update('year', v)}
      />
      <SelectFilter
        label="Architecture"
        value={filters.architecture}
        options={MILESTONE_FILTER_OPTIONS.architectures}
        onChange={(v) => update('architecture', v)}
      />
      <SelectFilter
        label="Technology"
        value={filters.technology}
        options={MILESTONE_FILTER_OPTIONS.technologies}
        onChange={(v) => update('technology', v)}
      />
      <SelectFilter
        label="Project"
        value={filters.project}
        options={MILESTONE_FILTER_OPTIONS.projects}
        onChange={(v) => update('project', v)}
      />
    </Stack>
  );
}
