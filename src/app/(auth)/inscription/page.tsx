import { SignupForm } from "@/components/auth/SignupForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription - Gestion Hangar Intelligent",
  description: "Créez un nouveau compte.",
};

export default function SignupPage() {
  return <SignupForm />;
}
