
import { useMemo, useCallback } from "react";

export function useMultiSelectField<T>(
  values: T[],
  setter: (arr: T[]) => void
) {
  const selected = useMemo(() => values, [values]);
  const onChange = useCallback(
    (arr: T[]) => setter(arr),
    [setter]
  );
  return { selected, onChange };
}
