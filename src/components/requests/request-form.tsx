"use client";

import { useActionState, useState } from "react";
import { CircleAlert, LoaderCircle } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { fill } from "@/lib/format";
import { REQUEST_CATALOG, type FieldError, type RequestType } from "@/lib/requests";
import { createRequest, type CreateRequestState } from "@/server/requests/actions";

type T = Dictionary["requests"];
type ChoiceName = Exclude<keyof T["fields"], "comment">;

export function RequestForm({ lang, type, t }: { lang: Locale; type: RequestType; t: T }) {
  const [state, formAction, pending] = useActionState<CreateRequestState, FormData>(createRequest, undefined);
  const spec = REQUEST_CATALOG[type];
  const commentSpec = spec.fields.find((f) => f.type === "text");
  const [commentLength, setCommentLength] = useState(state?.values?.comment?.length ?? 0);

  const errorText = (error: FieldError | undefined) =>
    error
      ? fill(t.errors[error], {
          min: commentSpec && commentSpec.type === "text" ? (commentSpec.min ?? 0) : 0,
          max: commentSpec && commentSpec.type === "text" ? commentSpec.max : 0,
        })
      : null;

  return (
    <form action={formAction} noValidate className="space-y-6">
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="type" value={type} />

      {state?.formError ? (
        <p role="alert" className="flex gap-2.5 rounded-xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
          <CircleAlert className="mt-px size-4 shrink-0" aria-hidden />
          {t.errors[state.formError]}
        </p>
      ) : null}

      {spec.fields.map((field) => {
        const error = state?.errors?.[field.name];
        const errorId = `${field.name}-error`;

        if (field.type === "choice") {
          const name = field.name as ChoiceName;
          const options = t.fields[name].options as Record<string, string>;
          const selected = state?.values?.[field.name] || field.default;
          const compact = field.options.every((o) => options[o].length <= 3);
          return (
            <fieldset key={field.name} aria-describedby={error ? errorId : undefined}>
              <legend className="mb-2 text-sm font-semibold">{t.fields[name].label}</legend>
              <div className={compact ? "flex gap-2" : "grid gap-2 sm:grid-cols-2"}>
                {field.options.map((option) => (
                  <label
                    key={option}
                    className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border bg-surface px-4 text-sm font-medium transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary-soft has-[:checked]:text-primary has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary ${
                      compact ? "w-16 justify-center px-0" : ""
                    } ${error ? "border-danger" : "border-line"}`}
                  >
                    <input
                      type="radio"
                      name={field.name}
                      value={option}
                      defaultChecked={selected === option}
                      className={compact ? "sr-only" : "size-4 accent-[var(--primary)]"}
                    />
                    {options[option]}
                  </label>
                ))}
              </div>
              {error ? (
                <p id={errorId} className="mt-2 text-sm font-medium text-danger">
                  {errorText(error)}
                </p>
              ) : null}
            </fieldset>
          );
        }

        return (
          <div key={field.name}>
            <label htmlFor="comment" className="mb-2 block text-sm font-semibold">
              {field.required ? t.fields.comment.labelRequired : t.fields.comment.label}
            </label>
            <textarea
              id="comment"
              name="comment"
              rows={4}
              maxLength={field.max}
              required={field.required}
              defaultValue={state?.values?.comment}
              placeholder={field.required ? undefined : t.fields.comment.placeholder}
              aria-invalid={Boolean(error)}
              aria-describedby={`comment-counter${error ? ` ${errorId}` : ""}`}
              onChange={(event) => setCommentLength(event.target.value.length)}
              className={`w-full rounded-xl border bg-surface px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 ${
                error ? "border-danger" : "border-line"
              }`}
            />
            <div className="mt-1 flex justify-between gap-3 text-sm">
              <span id={errorId} className="font-medium text-danger">
                {errorText(error)}
              </span>
              <span id="comment-counter" className="shrink-0 tabular-nums text-fg-muted">
                {fill(t.fields.comment.counter, { n: commentLength, max: field.max })}
              </span>
            </div>
          </div>
        );
      })}

      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-on-primary shadow-sm shadow-primary/30 transition hover:opacity-90 disabled:cursor-wait disabled:opacity-75 sm:w-auto sm:px-8"
      >
        {pending ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : null}
        {pending ? t.submitting : t.submit}
      </button>
    </form>
  );
}
