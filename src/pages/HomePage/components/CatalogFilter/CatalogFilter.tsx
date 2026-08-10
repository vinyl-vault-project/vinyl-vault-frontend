import {
  type FormEvent,
  type PointerEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import catalogFilterChevron from '../../../../assets/vinyl-vault/catalog-filter-chevron.svg';
import { Button } from '../../../../components/ui/Button/Button';
import { Checkbox } from '../../../../components/ui/Checkbox/Checkbox';
import { Select } from '../../../../components/ui/Select/Select';
import {
  type CatalogFilters,
  type FilterOption,
  countryOptions,
  defaultCatalogFilters,
  genreOptions,
  styleOptions,
  yearOptions,
} from '../../../../features/home/home.filters';
import './CatalogFilter.scss';

interface CatalogFilterProps {
  appliedFilters: CatalogFilters;
  id: string;
  isOpen: boolean;
  onApply: (filters: CatalogFilters) => void;
  onClose: () => void;
}

type CollapsibleGroup = 'genres' | 'styles';

export function CatalogFilter({
  appliedFilters,
  id,
  isOpen,
  onApply,
  onClose,
}: CatalogFilterProps) {
  const [draftFilters, setDraftFilters] =
    useState<CatalogFilters>(appliedFilters);
  const [expandedGroups, setExpandedGroups] = useState<
    Record<CollapsibleGroup, boolean>
  >({
    genres: true,
    styles: true,
  });
  const [yearError, setYearError] = useState('');
  const panelRef = useRef<HTMLDivElement | null>(null);
  const errorId = useId();
  const yearSelectOptions = useMemo(
    () =>
      yearOptions.map((year) => ({
        label: String(year),
        value: String(year),
      })),
    [],
  );

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (draftFilters.fromYear > draftFilters.toYear) {
      setYearError(
        'Choose a release year range where the first year is earlier.',
      );
      return;
    }

    setYearError('');
    onApply(draftFilters);
  }

  function handleClear() {
    setDraftFilters(defaultCatalogFilters);
    setYearError('');
  }

  function handleOverlayPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.target === panelRef.current) {
      onClose();
    }
  }

  function updateYear(field: 'fromYear' | 'toYear', value: string) {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      [field]: Number(value),
    }));
  }

  function toggleGroup(group: CollapsibleGroup) {
    setExpandedGroups((currentGroups) => ({
      ...currentGroups,
      [group]: !currentGroups[group],
    }));
  }

  function updateOption(
    field: 'countries' | 'genres' | 'styles',
    optionId: string,
    isChecked: boolean,
  ) {
    setDraftFilters((currentFilters) => {
      const currentValues = currentFilters[field];
      const nextValues = isChecked
        ? [...currentValues, optionId]
        : currentValues.filter((value) => value !== optionId);

      return {
        ...currentFilters,
        [field]: nextValues,
      };
    });
  }

  return (
    <div
      ref={panelRef}
      className={`catalog-filter${isOpen ? ' catalog-filter--open' : ''}`}
      id={id}
      onPointerDown={handleOverlayPointerDown}
    >
      <form
        className="catalog-filter__panel"
        aria-label="Catalog filters"
        aria-describedby={yearError ? errorId : undefined}
        onSubmit={handleSubmit}
      >
        <div className="app-container catalog-filter__inner">
          <div className="catalog-filter__actions">
            <Button type="submit" variant="compact">
              Apply Filters
            </Button>
            <Button type="button" variant="text" onClick={handleClear}>
              Clear filters
            </Button>

            <fieldset className="catalog-filter__years">
              <legend className="catalog-filter__legend">Release Year</legend>
              <Select
                id="catalog-filter-from-year"
                label="Release year from"
                value={String(draftFilters.fromYear)}
                options={yearSelectOptions}
                onChange={(value) => updateYear('fromYear', value)}
              />
              <span
                className="catalog-filter__year-divider"
                aria-hidden="true"
              />
              <Select
                id="catalog-filter-to-year"
                label="Release year to"
                value={String(draftFilters.toYear)}
                options={yearSelectOptions}
                onChange={(value) => updateYear('toYear', value)}
              />
              {yearError ? (
                <p className="catalog-filter__error" id={errorId} role="alert">
                  {yearError}
                </p>
              ) : null}
            </fieldset>
          </div>

          <FilterGroup
            field="countries"
            title="Country"
            options={countryOptions}
            selectedValues={draftFilters.countries}
            onChange={updateOption}
          />

          <FilterGroup
            field="genres"
            title="Genre"
            isExpanded={expandedGroups.genres}
            onToggle={() => toggleGroup('genres')}
            options={genreOptions}
            selectedValues={draftFilters.genres}
            onChange={updateOption}
          />

          <FilterGroup
            field="styles"
            title="Style"
            isExpanded={expandedGroups.styles}
            onToggle={() => toggleGroup('styles')}
            options={styleOptions}
            selectedValues={draftFilters.styles}
            onChange={updateOption}
          />
        </div>
      </form>
    </div>
  );
}

interface FilterGroupProps {
  field: 'countries' | 'genres' | 'styles';
  isExpanded?: boolean;
  onChange: (
    field: 'countries' | 'genres' | 'styles',
    optionId: string,
    isChecked: boolean,
  ) => void;
  onToggle?: () => void;
  options: FilterOption[];
  selectedValues: string[];
  title: string;
}

function FilterGroup({
  field,
  isExpanded,
  onChange,
  onToggle,
  options,
  selectedValues,
  title,
}: FilterGroupProps) {
  const groupId = useId();
  const isCollapsible = typeof isExpanded === 'boolean' && onToggle;
  const shouldRenderOptions = !isCollapsible || isExpanded;

  return (
    <fieldset className="catalog-filter__group">
      <legend className="catalog-filter__group-heading">
        {isCollapsible ? (
          <button
            className="catalog-filter__group-toggle"
            type="button"
            aria-controls={groupId}
            aria-expanded={isExpanded}
            onClick={onToggle}
          >
            <span>{title}</span>
            <img
              className="catalog-filter__group-icon"
              src={catalogFilterChevron}
              width="18"
              height="9"
              alt=""
              aria-hidden="true"
            />
          </button>
        ) : (
          <span>{title}</span>
        )}
      </legend>

      <div className="catalog-filter__option-list" id={groupId}>
        {shouldRenderOptions
          ? options.map((option) => (
              <Checkbox
                key={option.id}
                id={`catalog-filter-${field}-${option.id}`}
                label={option.label}
                count={option.count}
                checked={selectedValues.includes(option.id)}
                onChange={(isChecked) => onChange(field, option.id, isChecked)}
              />
            ))
          : null}
      </div>
    </fieldset>
  );
}
