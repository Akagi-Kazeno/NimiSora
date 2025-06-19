import {defineConfig, presetAttributify, presetIcons, presetWebFonts, presetWind4} from 'unocss';
import presetRemToPx from "@unocss/preset-rem-to-px";

export default defineConfig({
  shortcuts: [],
  presets: [
    presetWind4(),
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans: 'Chivo Mono',
        mono: 'Chivo Mono',
        serif: 'Chivo Mono',
      },
    }),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
    presetRemToPx(),
  ],
  rules: [],
});
