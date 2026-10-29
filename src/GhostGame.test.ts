import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GhostGame, CLASSES, SECONDARIES, CLASS_WEAPON_OPTIONS,
  rollShopOffer, CONSUMABLES, loadRun, clearSavedRun, audio,
} from "./GhostGame";

function createGame() {
  const canvas = document.createElement("canvas");
  vi.spyOn(canvas, "getContext").mockReturnValue({} as CanvasRenderingContext2D);
  const game = new GhostGame(canvas);
  game.resize(1280, 1800, 1);
  return game;
}

describe("consolidated game systems", () => {
  beforeEach(() => {
    vi.spyOn(audio, "play").mockImplementation(() => {});
    clearSavedRun();
  });
  afterEach(() => vi.restoreAllMocks());

  it("starts every class with its selected weapon pair", () => {
    for (const cls of CLASSES) {
      const game = createGame();
      const [first, second] = CLASS_WEAPON_OPTIONS[cls.id];
      game.start(cls.id, first);
      game.equipWeapons([first, second]);
      expect(game.stats.classId).toBe(cls.id);
      expect(game.stats.secondaryIds).toEqual([first, second]);
      expect(SECONDARIES[first].id).toBe(first);
      expect(game.enemies.length).toBeGreaterThan(0);
    }
  });

  it("rolls unique shop offers for the equipped weapons", () => {
    const offer = rollShopOffer(6, ["katana", "yumi"]);
    expect(offer).toHaveLength(6);
    expect(new Set(offer.map(item => item.effect)).size).toBe(6);
    const weaponUpgrades = offer.filter(item => /^dmg_/.test(item.effect));
    for (const item of weaponUpgrades) {
      expect(item.effect).toMatch(/^dmg_(katana|yumi)_(common|rare|leg)$/);
    }
  });

  it("saves and restores a run including weapons and consumables", () => {
    const game = createGame();
    game.start("samurai", "katana");
    game.equipWeapons(["katana", "tate"]);
    game.stats.mon = 123;
    game.stats.consumables[0] = CONSUMABLES.rice_ball.id;
    game.persistResumeSnapshot();
    const saved = loadRun();
    expect(saved).not.toBeNull();
    if (!saved) throw new Error("Run was not saved");
    const restored = createGame();
    restored.resumeFromSave(saved);
    expect(restored.stats.mon).toBe(123);
    expect(restored.stats.secondaryIds).toEqual(["katana", "tate"]);
    expect(restored.stats.consumables[0]).toBe("rice_ball");
  });
});