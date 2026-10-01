import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Ancienne adresse du module 1 : les informations personnelles ont désormais
 * leur page dédiée, hors de la numérotation de « Je me prépare ».
 */
export const Route = createFileRoute("/_app/partie-1")({
  beforeLoad: () => {
    throw redirect({ to: "/informations-personnelles" });
  },
});
