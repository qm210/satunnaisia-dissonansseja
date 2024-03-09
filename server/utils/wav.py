import numpy as np


def count_trailing_zeros(data: np.ndarray) -> int:
    """
    takes an 1d-array and counts the number of trailing zeros.
    I do not trust np.trim_zeros(), currently
    """


def trim_trailing_silence(data: np.ndarray, debug=False) -> np.ndarray:
    """
        extends np.trim_zeros to multi-channel data.
        caution: files read by sf are rows=sample, cols=channel, i.e. transposed!
    """
    if debug:
        print("CHECK NP SIZES OF 1. ORIGINAL DATA 2. TRIMMED END SILENCE ")
        np.info(data)

    channels = np.transpose(data)
    trimmed = [np.trim_zeros(channel, trim='b') for channel in channels]
    if debug:
        np.info(trimmed)

    max_length = max(len(channel) for channel in trimmed)
    result = np.array([channel[:max_length] for channel in channels])
    if debug:
        np.info(result)

    return np.transpose(result)


if __name__ == '__main__':
    # we transpose so it looks like the arrays produced by the soundfile package
    data = np.transpose(
        np.array([
            [1, 3, 0, 0, 0, 0, 0, 0],
            [1, 3, 0, 0, 3, 0, 0, 0]
        ])
    )
    print(trim_trailing_silence(data, debug=True))
