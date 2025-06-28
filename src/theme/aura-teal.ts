import { definePreset, palette } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

/** Aura c палитрой teal вместо emerald */
export default definePreset(Aura, {
  semantic: {
    primary: palette('{teal}')
  }
});
