import { describe, expect, it } from "vitest";
import { MESSAGE_CHAMPS_VIDES, authErrorMessage, champsVides } from "./auth-messages";

describe("authErrorMessage", () => {
  it("traduit les messages relevés par la QA", () => {
    expect(authErrorMessage({ message: "Anonymous sign-ins are disabled" })).toBe(MESSAGE_CHAMPS_VIDES);
    expect(authErrorMessage({ message: "missing email or phone" })).toBe(MESSAGE_CHAMPS_VIDES);
    expect(authErrorMessage({ message: "Password should be at least 6 characters." })).toBe(
      "Le mot de passe doit contenir au moins 8 caractères, avec des lettres et des chiffres.",
    );
  });

  it("se fie d'abord au code d'erreur de Supabase", () => {
    expect(authErrorMessage({ message: "whatever", code: "invalid_credentials" })).toBe("E-mail ou mot de passe incorrect.");
    expect(authErrorMessage({ message: "whatever", code: "email_not_confirmed" })).toBe(
      "Confirmez d'abord votre adresse e-mail grâce au lien reçu.",
    );
    expect(authErrorMessage({ message: "x", code: "over_email_send_rate_limit" })).toBe(
      "Patientez une minute avant de redemander l'e-mail.",
    );
    expect(authErrorMessage({ message: "x", code: "email_address_invalid" })).toBe("Cette adresse e-mail n'est pas valide.");
  });

  it("reconnaît les messages sans code", () => {
    expect(authErrorMessage({ message: "Invalid login credentials" })).toBe("E-mail ou mot de passe incorrect.");
    expect(authErrorMessage({ message: "For security purposes, you can only request this after 42 seconds." })).toBe(
      "Patientez une minute avant de redemander l'e-mail.",
    );
  });

  it("garde le message d'origine pour une erreur inconnue", () => {
    expect(authErrorMessage({ message: "Database error saving new user", code: "unexpected_failure" })).toBe(
      "Database error saving new user",
    );
  });
});

describe("champsVides", () => {
  it("détecte une adresse ou un mot de passe manquant", () => {
    expect(champsVides("", "secret")).toBe(true);
    expect(champsVides("   ", "secret")).toBe(true);
    expect(champsVides("a@b.fr", "")).toBe(true);
    expect(champsVides("a@b.fr", "secret")).toBe(false);
  });
});
