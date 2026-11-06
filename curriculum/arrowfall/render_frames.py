#!/usr/bin/env python3
"""Render each validated text frame as a deterministic terminal-style SVG."""

from html import escape
from pathlib import Path


ROOT = Path(__file__).parent / "checkpoints"


def render(frame_path: Path) -> None:
    lines = frame_path.read_text(encoding="utf-8").splitlines()
    columns = max((len(line) for line in lines), default=1)
    width = max(360, columns * 9 + 48)
    height = max(120, len(lines) * 19 + 48)
    text = []
    for index, line in enumerate(lines):
        y = 37 + index * 19
        text.append(
            f'  <text x="24" y="{y}" class="terminal">{escape(line)}</text>'
        )
    svg = "\n".join(
        [
            '<?xml version="1.0" encoding="UTF-8"?>',
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" '
            f'height="{height}" viewBox="0 0 {width} {height}" role="img">',
            f'  <title>{escape(frame_path.parent.parent.name)} representative frame</title>',
            '  <rect width="100%" height="100%" rx="12" fill="#10151c"/>',
            '  <style>.terminal { fill: #d7f9e9; font: 15px monospace; '
            'white-space: pre; }</style>',
            *text,
            "</svg>",
            "",
        ]
    )
    frame_path.with_suffix(".svg").write_text(svg, encoding="utf-8")


def main() -> None:
    for frame_path in sorted(ROOT.glob("*/tests/frame.txt")):
        render(frame_path)


if __name__ == "__main__":
    main()
