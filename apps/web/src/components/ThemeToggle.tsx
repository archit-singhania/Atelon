import { useEffect, useRef, useState } from 'react';
import { applyAppearance, readAppearance } from '../lib/appearance';

export default function ThemeToggle() {
  const [value, setValue] = useState(readAppearance); const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    applyAppearance(value); const query = matchMedia('(prefers-color-scheme: light)'); const update = () => applyAppearance(value); query.addEventListener('change', update); return () => query.removeEventListener('change', update);
  }, [value]);

  return (
    <><button className="icon-button" type="button" aria-label="Appearance settings" onClick={() => dialog.current?.showModal()}>◐</button><dialog ref={dialog} className="appearance-dialog glass-dense"><form method="dialog"><button className="btn ghost" aria-label="Close appearance settings">Close ×</button></form><p className="eyebrow">Make it yours</p><h2>Appearance</h2><div className="theme-swatches">{(['system', 'obsidian', 'pearl', 'titanium', 'midnight'] as const).map(theme => <button key={theme} className={`theme-swatch swatch-${theme}`} aria-pressed={value.theme === theme} onClick={() => setValue({ ...value, theme })}><i />{theme}</button>)}</div><label>Glass intensity<select value={value.glass} onChange={e => setValue({ ...value, glass: e.target.value as typeof value.glass })}><option value="full">Luminous</option><option value="reduced">Reduced transparency</option></select></label><label>Animation<select value={value.motion} onChange={e => setValue({ ...value, motion: e.target.value as typeof value.motion })}><option value="system">Follow device preference</option><option value="reduced">Reduced effects</option></select></label></dialog></>
  );
}
