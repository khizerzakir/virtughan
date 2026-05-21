from __future__ import annotations

import numexpr as ne
import numpy as np

MAX_FORMULA_LENGTH = 512
MAX_BANDS = 12


class FormulaError(ValueError):
    pass


def validate_formula(formula: str, supplied_bands: list[str]) -> set[str]:
    if not formula or not formula.strip():
        raise FormulaError("formula must not be empty")
    if len(formula) > MAX_FORMULA_LENGTH:
        raise FormulaError(f"formula length {len(formula)} exceeds maximum {MAX_FORMULA_LENGTH}")

    if not supplied_bands:
        raise FormulaError("bands must not be empty")
    if len(supplied_bands) > MAX_BANDS:
        raise FormulaError(f"too many bands ({len(supplied_bands)}); maximum is {MAX_BANDS}")

    supplied_set = set(supplied_bands)
    if len(supplied_set) != len(supplied_bands):
        duplicates = sorted({b for b in supplied_bands if supplied_bands.count(b) > 1})
        raise FormulaError(f"duplicate bands in request: {duplicates}")

    try:
        compiled = ne.NumExpr(formula)
    except (SyntaxError, ValueError, TypeError) as exc:
        raise FormulaError(f"invalid formula: {exc}") from exc

    required = set(compiled.input_names)

    missing = required - supplied_set
    extra = supplied_set - required
    if missing or extra:
        parts = []
        if missing:
            parts.append(f"formula references unknown band(s): {sorted(missing)}")
        if extra:
            parts.append(f"bands not used by formula: {sorted(extra)}")
        raise FormulaError("; ".join(parts))

    stub = {name: np.ones(1, dtype=np.float64) for name in required}
    try:
        with np.errstate(divide="ignore", invalid="ignore"):
            ne.evaluate(formula, local_dict=stub)
    except (SyntaxError, ValueError, TypeError, KeyError) as exc:
        raise FormulaError(f"formula failed dry-run evaluation: {exc}") from exc

    return required
