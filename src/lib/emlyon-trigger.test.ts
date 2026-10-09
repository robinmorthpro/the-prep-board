import { describe, expect, it } from "vitest";
import { EmlyonCardsSilence } from "./emlyon-trigger";

describe("emlyon — tirage des cartes après 5 s de silence", () => {
  it("pause de 3 s puis reprise : pas de tirage", () => {
    const silence = new EmlyonCardsSilence();
    silence.answerEnded(0);
    expect(silence.isDue(3_000)).toBe(false);
    silence.voice(); // reprise à 3 s
    expect(silence.isDue(5_000)).toBe(false);
    expect(silence.isDue(8_000)).toBe(false);
  });

  it("silence de 5 s après la nouvelle prise de parole : tirage", () => {
    const silence = new EmlyonCardsSilence();
    silence.answerEnded(0);
    silence.voice();
    silence.answerEnded(20_000);
    expect(silence.isDue(24_999)).toBe(false);
    expect(silence.isDue(25_000)).toBe(true);
  });
});
