"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { defaultLocale, hasLocale, type Locale } from "@/i18n/config";
import { getCurrentUser } from "@/server/dal/user";
import { authenticate } from "./authenticate";
import { UNKNOWN_IP } from "./rate-limit";
import { createSession, deleteAllSessions, deleteCurrentSession } from "./session";

export type LoginState = { error: "required" | "invalid" | "throttled"; login: string } | undefined;

// Server Actions cannot read the [lang] root param, so forms send the language in a hidden field.
function localeFrom(formData: FormData): Locale {
  const value = String(formData.get("lang") ?? "");
  return hasLocale(value) ? value : defaultLocale;
}

async function clientIp(): Promise<string> {
  const h = await headers();
  // Set by the reverse proxy in front of the app (nginx) in production.
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || UNKNOWN_IP;
}

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const locale = localeFrom(formData);
  const loginValue = String(formData.get("login") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!loginValue || !password) return { error: "required", login: loginValue };
  if (loginValue.length > 64 || password.length > 256) return { error: "invalid", login: loginValue };

  const result = await authenticate(loginValue, password, await clientIp());
  if (!result.ok) return { error: result.reason, login: loginValue };

  await createSession(result.userId);
  redirect(`/${locale}`);
}

export async function logout(formData: FormData): Promise<void> {
  await deleteCurrentSession();
  redirect(`/${localeFrom(formData)}/login`);
}

export async function logoutEverywhere(formData: FormData): Promise<void> {
  // Re-check the session inside the action: never trust that the button was shown to a signed-in user.
  const user = await getCurrentUser();
  if (user) await deleteAllSessions(user.id);
  redirect(`/${localeFrom(formData)}/login`);
}
