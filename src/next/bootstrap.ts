import type { SkinRegistry } from '../types.js';

/**
 * Serialize an ES5-safe snippet that restores `document.documentElement[data-skin]`
 * from `localStorage` before paint (pair with Next.js `<Script strategy="beforeInteractive" />`).
 *
 * Embeds IDs + storage key once so hosts do not hand-maintain duplicated allowlists.
 */
export function buildSkinBootstrapScript<Id extends string>(
  registry: SkinRegistry<Id>,
): string {
  const idsLiteral = JSON.stringify(registry.ids.map((id) => String(id)));
  const keyLiteral = JSON.stringify(registry.storageKey);
  const defaultLiteral = JSON.stringify(String(registry.defaultSkin));

  return `(()=>{try{var K=${keyLiteral};var D=${defaultLiteral};var IDS=${idsLiteral};var V={};for(var i=0;i<IDS.length;i++){V[IDS[i]]=1;}var r=null;try{if(typeof localStorage!=="undefined"){r=localStorage.getItem(K);}}catch(_e){}var pick=(r&&V[r])?r:D;if(typeof document!=="undefined"&&document.documentElement){document.documentElement.setAttribute("data-skin",pick);}}catch(_outer){}})();`;
}
