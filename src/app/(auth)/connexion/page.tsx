import { LoginForm } from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion - Gestion Hangar Intelligent",
  description: "Connectez-vous à votre compte.",
};

export default function LoginPage() {
  return <LoginForm />;
}
