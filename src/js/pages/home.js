import { initHero } from '../home/hero.js';
import { initManifesto } from '../home/manifesto.js';
import { initTurntable, initPower, initConfigs, initSafety, initDock, initNetwork, initCta } from '../home/sections.js';

export function init() {
  const hero = initHero();
  initManifesto();
  initTurntable();
  initPower();
  initConfigs();
  initSafety();
  initDock();
  initNetwork();
  initCta();
  return hero;
}
