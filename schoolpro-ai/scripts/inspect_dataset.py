from pathlib import Path

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATASET_PATH = PROJECT_ROOT / "data" / "samples" / "student-mat.csv"


def main() -> None:
    if not DATASET_PATH.exists():
        raise FileNotFoundError(
            f"Không tìm thấy file dữ liệu: {DATASET_PATH}"
        )

    df = pd.read_csv(DATASET_PATH, sep=";")

    print("\n=== DATASET OVERVIEW ===")
    print(f"File: {DATASET_PATH.name}")
    print(f"Số dòng: {df.shape[0]}")
    print(f"Số cột: {df.shape[1]}")

    print("\n=== COLUMNS ===")
    print(df.columns.tolist())

    print("\n=== DATA TYPES ===")
    print(df.dtypes)

    print("\n=== MISSING VALUES ===")
    print(df.isnull().sum())

    print("\n=== DUPLICATE ROWS ===")
    print(df.duplicated().sum())

    score_columns = [
        column
        for column in ["G1", "G2", "G3"]
        if column in df.columns
    ]

    if score_columns:
        print("\n=== SCORE STATISTICS ===")
        print(df[score_columns].describe())

    print("\n=== SAMPLE ROWS ===")
    print(df.head())


if __name__ == "__main__":
    main()
