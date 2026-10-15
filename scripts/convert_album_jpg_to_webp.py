#!/usr/bin/env python3
"""Batch-convert album-cover JPEG files to WebP with cwebp.

The source files are never modified. Relative subdirectory structure is
preserved in the destination directory.
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = PROJECT_ROOT / "Photos" / "albums" / "JPG"
DEFAULT_DESTINATION = PROJECT_ROOT / "Photos" / "albums" / "WEBP"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert every .jpg/.jpeg album cover in a directory to WebP."
    )
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--destination", type=Path, default=DEFAULT_DESTINATION)
    parser.add_argument(
        "--quality",
        type=int,
        default=90,
        choices=range(0, 101),
        metavar="0-100",
        help="WebP quality (default: 90)",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Replace destination WebP files that already exist",
    )
    return parser.parse_args()


def find_jpegs(source: Path) -> list[Path]:
    return sorted(
        (
            path
            for path in source.rglob("*")
            if path.is_file() and path.suffix.casefold() in {".jpg", ".jpeg"}
        ),
        key=lambda path: str(path.relative_to(source)).casefold(),
    )


def convert(source_file: Path, destination_file: Path, quality: int) -> None:
    destination_file.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(
        prefix=f".{destination_file.stem}-",
        suffix=".webp",
        dir=destination_file.parent,
        delete=False,
    ) as temporary:
        temporary_path = Path(temporary.name)

    try:
        subprocess.run(
            [
                "cwebp",
                "-quiet",
                "-q",
                str(quality),
                "-m",
                "6",
                "-metadata",
                "all",
                str(source_file),
                "-o",
                str(temporary_path),
            ],
            check=True,
        )
        if temporary_path.stat().st_size == 0:
            raise RuntimeError("cwebp produced an empty file")
        temporary_path.replace(destination_file)
    finally:
        temporary_path.unlink(missing_ok=True)


def main() -> int:
    args = parse_args()
    source = args.source.expanduser().resolve()
    destination = args.destination.expanduser().resolve()

    if not source.is_dir():
        print(f"Source directory does not exist: {source}", file=sys.stderr)
        return 2
    if shutil.which("cwebp") is None:
        print("cwebp was not found in PATH. Install WebP tools first.", file=sys.stderr)
        return 2

    files = find_jpegs(source)
    if not files:
        print(f"No JPEG files found in: {source}")
        return 0

    converted = 0
    skipped = 0
    failed = 0

    for index, source_file in enumerate(files, start=1):
        relative = source_file.relative_to(source).with_suffix(".webp")
        destination_file = destination / relative
        label = f"[{index:>3}/{len(files)}] {relative}"

        if destination_file.exists() and not args.overwrite:
            print(f"SKIP    {label}")
            skipped += 1
            continue

        try:
            convert(source_file, destination_file, args.quality)
            print(f"OK      {label}")
            converted += 1
        except (OSError, subprocess.CalledProcessError, RuntimeError) as error:
            print(f"FAILED  {label}: {error}", file=sys.stderr)
            failed += 1

    print(
        f"\nFinished: {converted} converted, {skipped} skipped, "
        f"{failed} failed.\nDestination: {destination}"
    )
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
