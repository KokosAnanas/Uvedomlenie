import { definePreset, palette } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

/** Aura c палитрой lime вместо emerald */
export default definePreset(Aura, {
  semantic: {
    primary: palette('{lime}')
  }
});
