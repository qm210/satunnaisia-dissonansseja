import random


def mixed_random_between_uniform_and_triangular(lower_bound, upper_bound, pivot) -> int:
    """
    This is the skewed random distribution I thought of (for no better idea)
    you select a range and another single value, the pivot.
    - if the pivot is the interval center, this returns the uniform random value
    - if the pivit is at one of the boundaries, it returns a triangular distribution
      with the maximum at that boundary and decreasing towards the other boundary
    - inbetween, it's a linear mix between these two
    """
    center = (lower_bound + upper_bound) / 2
    uniform = random.randint(lower_bound, upper_bound)
    if pivot < center:
        triangular = random.triangular(lower_bound, upper_bound, lower_bound)
        mix = (pivot - lower_bound) / (center - lower_bound)
    elif pivot > center:
        triangular = random.triangular(lower_bound, upper_bound, upper_bound)
        mix = (pivot - upper_bound) / (center - upper_bound)
    else:
        triangular = 0
        mix = 1
    return round(mix * uniform + (1 - mix) * triangular)


def human_readable_bytes(num, suffix="B"):
    for unit in ("", "Ki", "Mi", "Gi", "Ti", "Pi", "Ei", "Zi"):
        if abs(num) < 1024:
            return f"{num:3.1f}{unit}{suffix}"
        num /= 1024.0
    return f"{num:.1f}Yi{suffix}"
