"use client";

import { useActionState, useState } from "react";
import { CircleAlert, Eye, EyeOff, LoaderCircle } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { login, type LoginState } from "@/server/auth/actions";

const inputClass =
  "h-12 w-full rounded-xl border border-line bg-surface px-4 text-base text-fg outline-none transition " +
  "focus:border-primary focus:ring-4 focus:ring-primary/15 aria-[invalid=true]:border-danger";

export function LoginForm({ lang, t }: { lang: Locale; t: Dictionary["login"] }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, undefined);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const hasError = Boolean(state?.error);

  return (
    <form action={formAction} noValidate className="mt-8 space-y-5">
      <input type="hidden" name="lang" value={lang} />

      {state?.error ? (
        <p id="login-error" role="alert" className="flex gap-2.5 rounded-xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
          <CircleAlert className="mt-px size-4 shrink-0" aria-hidden />
          {t.errors[state.error]}
        </p>
      ) : null}

      <div>
        <label htmlFor="login" className="mb-1.5 block text-sm font-medium">
          {t.loginLabel}
        </label>
        <input
          id="login"
          name="login"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          defaultValue={state?.login}
          aria-invalid={hasError}
          aria-describedby={hasError ? "login-error" : undefined}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          {t.passwordLabel}
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={passwordVisible ? "text" : "password"}
            autoComplete="current-password"
            required
            aria-invalid={hasError}
            aria-describedby={hasError ? "login-error" : undefined}
            className={`${inputClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setPasswordVisible((v) => !v)}
            aria-label={passwordVisible ? t.hidePassword : t.showPassword}
            aria-pressed={passwordVisible}
            className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-xl text-fg-muted transition-colors hover:text-fg"
          >
            {passwordVisible ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-on-primary shadow-sm shadow-primary/30 transition hover:opacity-90 disabled:cursor-wait disabled:opacity-75"
      >
        {pending ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : null}
        {pending ? t.submitting : t.submit}
      </button>
    </form>
  );
}
