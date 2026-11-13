"""WCAG contrast check for the cabinet palette (light and dark themes)."""

THEMES = {
    "light": {
        "bg": "#F4F6FB", "surface": "#FFFFFF", "surface2": "#EDF1F8",
        "text": "#0E1626", "muted": "#586178",
        "primary": "#1F55E6", "on-primary": "#FFFFFF", "primary-soft": "#E6EDFF",
        "success": "#0B7A54", "success-soft": "#E1F5EC",
        "warning": "#A34B06", "warning-soft": "#FFF1D6",
        "danger": "#C42525", "danger-soft": "#FDE7E7",
    },
    "dark": {
        "bg": "#0A0F1E", "surface": "#111830", "surface2": "#18213D",
        "text": "#E7ECF7", "muted": "#9AA4BC",
        "primary": "#7C9BFF", "on-primary": "#0A0F1E", "primary-soft": "#1B2A57",
        "success": "#4FD1A0", "success-soft": "#10342A",
        "warning": "#F5B451", "warning-soft": "#3A2A10",
        "danger": "#FF8A8A", "danger-soft": "#3D1A1F",
    },
}

PAIRS = [
    ("text", "bg"), ("text", "surface"), ("text", "surface2"),
    ("muted", "bg"), ("muted", "surface"), ("muted", "surface2"),
    ("primary", "surface"), ("primary", "bg"), ("on-primary", "primary"),
    ("primary", "primary-soft"),
    ("success", "success-soft"), ("success", "surface"),
    ("warning", "warning-soft"), ("warning", "surface"),
    ("danger", "danger-soft"), ("danger", "surface"),
]


def lum(hex_color: str) -> float:
    h = hex_color.lstrip("#")
    rgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]


def ratio(a: str, b: str) -> float:
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


worst = 99.0
for name, t in THEMES.items():
    print(f"--- {name}")
    for fg, bg in PAIRS:
        r = ratio(t[fg], t[bg])
        worst = min(worst, r)
        flag = "OK " if r >= 4.5 else "LOW"
        print(f"  {flag} {fg:>11} on {bg:<13} {r:5.2f}")
print(f"worst: {worst:.2f}")
