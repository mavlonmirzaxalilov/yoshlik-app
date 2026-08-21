import twemoji from "@twemoji/api";

// twemoji emoji kodini Noto Emoji fayl nomiga o'giradi
function toNotoName(iconId: string): string {
  const cleaned = iconId
    .split("-")
    .filter((part) => part !== "fe0f") // variation selector'ni olib tashlaymiz
    .join("_");
  return cleaned;
}

// Elementdagi barcha emoji'larni Noto Emoji rasmiga aylantiradi
export function parseTwemoji(node: HTMLElement) {
  twemoji.parse(node, {
    folder: "svg",
    ext: ".svg",
    callback: (iconId: string) => {
      const name = toNotoName(iconId);
      return `https://cdn.jsdelivr.net/gh/googlefonts/noto-emoji@main/svg/emoji_u${name}.svg`;
    },
  });
}