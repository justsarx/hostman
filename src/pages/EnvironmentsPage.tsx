import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  DownloadSimple,
  Plus,
  Trash,
  UploadSimple,
  WarningCircle,
} from '@phosphor-icons/react';
import { KeyValueTable } from '../components/common/KeyValueTable';
import { useWorkspace } from '../context/useWorkspace';
import { useColorScheme, type ColorSchemePreference } from '../hooks/useColorScheme';
import type { Environment, KeyValuePair } from '../types/api';
import {
  validateEnvironmentForm,
  type EnvFormErrors,
  type EnvFormValues,
} from '../utils/validation';

const INITIAL_FORM: EnvFormValues = {
  name: '',
  baseUrl: '',
  tokenKey: '',
  tokenValue: '',
};

export function EnvironmentsPage() {
  const navigate = useNavigate();
  const {
    environments,
    activeEnvId,
    setActiveEnvironment,
    saveEnvironments,
    createEnvironmentFromForm,
    exportWorkspace,
    importWorkspaceFile,
    importStatus,
  } = useWorkspace();
  const { preference, systemScheme, setSchemePreference } = useColorScheme();

  const [selectedEnvId, setSelectedEnvId] = useState<string | null>(
    () => activeEnvId ?? environments[0]?.id ?? null
  );
  const [formValues, setFormValues] = useState<EnvFormValues>(INITIAL_FORM);
  const [touched, setTouched] = useState<Record<keyof EnvFormValues, boolean>>({
    name: false,
    baseUrl: false,
    tokenKey: false,
    tokenValue: false,
  });
  const [errors, setErrors] = useState<EnvFormErrors>({});
  const [activateOnCreate, setActivateOnCreate] = useState(true);
  const [createdBanner, setCreatedBanner] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement | null>(null);
  const baseUrlRef = useRef<HTMLInputElement | null>(null);
  const tokenKeyRef = useRef<HTMLInputElement | null>(null);
  const tokenValRef = useRef<HTMLInputElement | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const selectedEnv =
    environments.find((e) => e.id === selectedEnvId) ?? environments[0] ?? null;

  const updateField = (field: keyof EnvFormValues, value: string) => {
    const nextValues = { ...formValues, [field]: value };
    setFormValues(nextValues);
    if (touched[field]) {
      const nextErrors = validateEnvironmentForm(nextValues, environments);
      setErrors((prev) => ({
        ...prev,
        [field]: nextErrors[field],
        ...(field === 'tokenKey' || field === 'tokenValue'
          ? { tokenKey: nextErrors.tokenKey, tokenValue: nextErrors.tokenValue }
          : {}),
      }));
    }
  };

  const handleBlur = (field: keyof EnvFormValues) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const nextErrors = validateEnvironmentForm(formValues, environments);
    setErrors((prev) => ({
      ...prev,
      [field]: nextErrors[field],
      ...(field === 'tokenKey' || field === 'tokenValue'
        ? { tokenKey: nextErrors.tokenKey, tokenValue: nextErrors.tokenValue }
        : {}),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, baseUrl: true, tokenKey: true, tokenValue: true });
    const nextErrors = validateEnvironmentForm(formValues, environments);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.name) nameRef.current?.focus();
      else if (nextErrors.baseUrl) baseUrlRef.current?.focus();
      else if (nextErrors.tokenKey) tokenKeyRef.current?.focus();
      else if (nextErrors.tokenValue) tokenValRef.current?.focus();
      return;
    }

    const variables: KeyValuePair[] = [
      {
        id: crypto.randomUUID(),
        key: 'BASE_URL',
        value: formValues.baseUrl.trim(),
        enabled: true,
      },
    ];

    if (formValues.tokenKey.trim()) {
      variables.push({
        id: crypto.randomUUID(),
        key: formValues.tokenKey.trim(),
        value: formValues.tokenValue.trim(),
        enabled: true,
      });
    }

    const created: Environment = {
      id: crypto.randomUUID(),
      name: formValues.name.trim(),
      variables,
    };

    createEnvironmentFromForm(created, activateOnCreate);
    setSelectedEnvId(created.id);
    setFormValues(INITIAL_FORM);
    setTouched({ name: false, baseUrl: false, tokenKey: false, tokenValue: false });
    setErrors({});
    setCreatedBanner(`Environment "${created.name}" created${activateOnCreate ? ' and activated' : ''}.`);
    setTimeout(() => setCreatedBanner(null), 4000);
  };

  const handleUpdateEnvVars = (envId: string, variables: KeyValuePair[]) => {
    const next = environments.map((env) => (env.id === envId ? { ...env, variables } : env));
    saveEnvironments(next, activeEnvId);
  };

  const handleDeleteEnv = (envId: string) => {
    const next = environments.filter((e) => e.id !== envId);
    const nextActive = activeEnvId === envId ? next[0]?.id ?? null : activeEnvId;
    saveEnvironments(next, nextActive);
    if (selectedEnvId === envId) {
      setSelectedEnvId(next[0]?.id ?? null);
    }
  };

  return (
    <main className="min-h-0 flex-1 overflow-y-auto bg-rack-canvas p-4 md:p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rack-border pb-4">
          <div>
            <h1 className="font-mono text-sm font-semibold uppercase tracking-wider text-rack-text">
              Environments &amp; Workspace Config
            </h1>
            <p className="mt-1 font-sans text-xs text-rack-muted">
              Create validated environments for <code className="text-rack-accent">{'{{BASE_URL}}'}</code> interpolation, edit active variables, or back up your workspace as JSON.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportWorkspace}
              className="inline-flex h-8 items-center gap-1.5 rounded-[2px] border border-rack-border bg-rack-elevated px-3 font-mono text-[11px] uppercase tracking-wider text-rack-text hover:border-rack-borderStrong"
            >
              <DownloadSimple size={14} weight="bold" />
              Export JSON
            </button>
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              className="inline-flex h-8 items-center gap-1.5 rounded-[2px] border border-rack-border bg-rack-elevated px-3 font-mono text-[11px] uppercase tracking-wider text-rack-text hover:border-rack-borderStrong"
            >
              <UploadSimple size={14} weight="bold" />
              Import JSON
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (file) await importWorkspaceFile(file);
              }}
              className="hidden"
              aria-label="Import workspace JSON"
            />
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex h-8 items-center rounded-[2px] border border-rack-accent bg-rack-accent px-3 font-mono text-xs font-semibold uppercase tracking-wider text-rack-onAccent hover:bg-rack-accentHover"
            >
              Workbench
            </button>
          </div>
        </div>

        {/* Appearance / Theme Preference (Tri-State Control) */}
        <fieldset className="flex flex-wrap items-center justify-between gap-3 border border-rack-border bg-rack-surface px-4 py-3">
          <legend className="px-1 font-mono text-[10px] uppercase tracking-wider text-rack-muted">
            Appearance / Color Scheme
          </legend>
          <span className="font-sans text-xs text-rack-muted">
            Choose Light, Dark, or follow your operating system preference.
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { value: 'system', label: `System (Currently ${systemScheme})` },
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ] as { value: ColorSchemePreference; label: string }[]
            ).map((option) => (
              <label
                key={option.value}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-[2px] border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider ${
                  preference === option.value
                    ? 'border-rack-accent bg-rack-accent/10 text-rack-accent'
                    : 'border-rack-border bg-rack-elevated text-rack-muted hover:text-rack-text'
                }`}
              >
                <input
                  type="radio"
                  name="color-scheme-pref"
                  value={option.value}
                  checked={preference === option.value}
                  onChange={() => setSchemePreference(option.value)}
                  className="h-3.5 w-3.5 cursor-pointer"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {importStatus ? (
          <div
            role="status"
            className="border border-rack-accent/50 bg-rack-accent/10 px-3 py-2 font-mono text-xs text-rack-accent"
          >
            {importStatus}
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[400px_1fr]">
          {/* Validated Create Environment Form */}
          <section aria-labelledby="create-env-heading" className="border border-rack-border bg-rack-surface p-4">
            <h2
              id="create-env-heading"
              className="border-b border-rack-border pb-2 font-mono text-xs font-semibold uppercase tracking-wider text-rack-text"
            >
              Create New Environment
            </h2>

            {createdBanner ? (
              <div
                role="status"
                className="mt-3 flex items-center gap-2 border border-rack-ok/40 bg-rack-ok/10 px-3 py-2 font-mono text-xs text-rack-ok"
              >
                <CheckCircle size={15} weight="bold" className="shrink-0" />
                <span>{createdBanner}</span>
              </div>
            ) : null}

            <form
              noValidate
              aria-labelledby="create-env-heading"
              onSubmit={handleSubmit}
              className="mt-3 flex flex-col gap-3.5"
            >
              {/* Environment Name */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="env-form-name"
                  className="font-mono text-[11px] font-medium uppercase tracking-wider text-rack-text"
                >
                  Environment Name <span className="text-rack-accent">*</span>
                </label>
                <span id="env-form-name-hint" className="font-mono text-[10px] text-rack-dim">
                  2–40 characters, unique across workspace (e.g. Staging API)
                </span>
                <input
                  ref={nameRef}
                  id="env-form-name"
                  name="name"
                  type="text"
                  required
                  value={formValues.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  aria-invalid={errors.name ? 'true' : 'false'}
                  aria-describedby={
                    errors.name ? 'env-form-name-hint env-form-name-error' : 'env-form-name-hint'
                  }
                  placeholder="Staging"
                  className={`h-9 rounded-[2px] border bg-rack-elevated px-2.5 font-mono text-xs text-rack-text placeholder:text-rack-dim focus:outline-none ${
                    errors.name
                      ? 'border-rack-err bg-rack-err/5'
                      : 'border-rack-border focus:border-rack-accent'
                  }`}
                />
                {errors.name ? (
                  <p
                    id="env-form-name-error"
                    className="flex items-center gap-1 font-mono text-[11px] text-rack-err"
                  >
                    <WarningCircle size={13} weight="bold" className="shrink-0" />
                    <span>Error: {errors.name}</span>
                  </p>
                ) : null}
              </div>

              {/* Base URL */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="env-form-url"
                  className="font-mono text-[11px] font-medium uppercase tracking-wider text-rack-text"
                >
                  BASE_URL <span className="text-rack-accent">*</span>
                </label>
                <span id="env-form-url-hint" className="font-mono text-[10px] text-rack-dim">
                  Full origin with protocol (e.g. http://localhost:8080 or https://api.staging.dev)
                </span>
                <input
                  ref={baseUrlRef}
                  id="env-form-url"
                  name="baseUrl"
                  type="url"
                  required
                  spellCheck={false}
                  autoCapitalize="none"
                  value={formValues.baseUrl}
                  onChange={(e) => updateField('baseUrl', e.target.value)}
                  onBlur={() => handleBlur('baseUrl')}
                  aria-invalid={errors.baseUrl ? 'true' : 'false'}
                  aria-describedby={
                    errors.baseUrl ? 'env-form-url-hint env-form-url-error' : 'env-form-url-hint'
                  }
                  placeholder="https://api.example.com"
                  className={`h-9 rounded-[2px] border bg-rack-elevated px-2.5 font-mono text-xs text-rack-text placeholder:text-rack-dim focus:outline-none ${
                    errors.baseUrl
                      ? 'border-rack-err bg-rack-err/5'
                      : 'border-rack-border focus:border-rack-accent'
                  }`}
                />
                {errors.baseUrl ? (
                  <p
                    id="env-form-url-error"
                    className="flex items-center gap-1 font-mono text-[11px] text-rack-err"
                  >
                    <WarningCircle size={13} weight="bold" className="shrink-0" />
                    <span>Error: {errors.baseUrl}</span>
                  </p>
                ) : null}
              </div>

              {/* Optional Extra Variable */}
              <fieldset className="flex flex-col gap-2.5 border border-rack-border bg-rack-canvas p-3">
                <legend className="px-1 font-mono text-[10px] uppercase tracking-wider text-rack-muted">
                  Optional Secondary Variable
                </legend>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="env-form-key"
                    className="font-mono text-[11px] text-rack-muted"
                  >
                    Variable Key
                  </label>
                  <input
                    ref={tokenKeyRef}
                    id="env-form-key"
                    name="tokenKey"
                    type="text"
                    spellCheck={false}
                    value={formValues.tokenKey}
                    onChange={(e) => updateField('tokenKey', e.target.value)}
                    onBlur={() => handleBlur('tokenKey')}
                    aria-invalid={errors.tokenKey ? 'true' : 'false'}
                    aria-describedby={errors.tokenKey ? 'env-form-key-error' : undefined}
                    placeholder="API_TOKEN"
                    className={`h-8 rounded-[2px] border bg-rack-elevated px-2.5 font-mono text-xs text-rack-text placeholder:text-rack-dim focus:outline-none ${
                      errors.tokenKey
                        ? 'border-rack-err bg-rack-err/5'
                        : 'border-rack-border focus:border-rack-accent'
                    }`}
                  />
                  {errors.tokenKey ? (
                    <p
                      id="env-form-key-error"
                      className="flex items-center gap-1 font-mono text-[11px] text-rack-err"
                    >
                      <WarningCircle size={13} weight="bold" className="shrink-0" />
                      <span>Error: {errors.tokenKey}</span>
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="env-form-val"
                    className="font-mono text-[11px] text-rack-muted"
                  >
                    Variable Value
                  </label>
                  <input
                    ref={tokenValRef}
                    id="env-form-val"
                    name="tokenValue"
                    type="text"
                    spellCheck={false}
                    value={formValues.tokenValue}
                    onChange={(e) => updateField('tokenValue', e.target.value)}
                    onBlur={() => handleBlur('tokenValue')}
                    aria-invalid={errors.tokenValue ? 'true' : 'false'}
                    aria-describedby={errors.tokenValue ? 'env-form-val-error' : undefined}
                    placeholder="sk_test_12345"
                    className={`h-8 rounded-[2px] border bg-rack-elevated px-2.5 font-mono text-xs text-rack-text placeholder:text-rack-dim focus:outline-none ${
                      errors.tokenValue
                        ? 'border-rack-err bg-rack-err/5'
                        : 'border-rack-border focus:border-rack-accent'
                    }`}
                  />
                  {errors.tokenValue ? (
                    <p
                      id="env-form-val-error"
                      className="flex items-center gap-1 font-mono text-[11px] text-rack-err"
                    >
                      <WarningCircle size={13} weight="bold" className="shrink-0" />
                      <span>Error: {errors.tokenValue}</span>
                    </p>
                  ) : null}
                </div>
              </fieldset>

              <div className="flex items-center gap-2">
                <input
                  id="env-form-activate"
                  type="checkbox"
                  checked={activateOnCreate}
                  onChange={(e) => setActivateOnCreate(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded-none border border-rack-borderStrong bg-rack-elevated"
                />
                <label
                  htmlFor="env-form-activate"
                  className="cursor-pointer font-mono text-xs text-rack-muted"
                >
                  Set as active environment immediately
                </label>
              </div>

              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[2px] border border-rack-accent bg-rack-accent px-4 font-mono text-xs font-semibold uppercase tracking-wider text-rack-onAccent hover:bg-rack-accentHover"
              >
                <Plus size={14} weight="bold" />
                Create Environment
              </button>
            </form>
          </section>

          {/* Existing Environments & Variable Matrix */}
          <section aria-label="Configured environments" className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {environments.map((env) => {
                const isSelected = selectedEnv?.id === env.id;
                const isActive = activeEnvId === env.id;
                return (
                  <div
                    key={env.id}
                    className={`flex items-center border ${
                      isSelected
                        ? 'border-rack-accent bg-rack-elevated'
                        : 'border-rack-border bg-rack-surface'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedEnvId(env.id)}
                      className="flex items-center gap-2 px-3 py-1.5 font-mono text-xs text-rack-text"
                    >
                      <span>{env.name}</span>
                      {isActive ? (
                        <span className="rounded-[2px] bg-rack-ok/20 px-1 py-0.5 text-[9px] font-semibold uppercase text-rack-ok">
                          Active
                        </span>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEnv(env.id)}
                      aria-label={`Delete ${env.name}`}
                      className="mr-1 inline-flex h-6 w-6 items-center justify-center text-rack-dim hover:text-rack-err"
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                );
              })}
            </div>

            {selectedEnv ? (
              <div className="flex flex-col gap-3 border border-rack-border bg-rack-surface p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rack-border pb-2.5">
                  <div>
                    <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-rack-text">
                      {selectedEnv.name} Variables
                    </h2>
                    <p className="font-mono text-[11px] text-rack-dim">
                      Changes auto-save to localStorage and sync with the Workbench.
                    </p>
                  </div>
                  {activeEnvId !== selectedEnv.id ? (
                    <button
                      type="button"
                      onClick={() => setActiveEnvironment(selectedEnv.id)}
                      className="h-7 rounded-[2px] border border-rack-borderStrong bg-rack-elevated px-2.5 font-mono text-[11px] uppercase tracking-wider text-rack-text hover:border-rack-accent hover:text-rack-accent"
                    >
                      Set Active
                    </button>
                  ) : null}
                </div>

                <KeyValueTable
                  caption={`${selectedEnv.name} variables`}
                  items={selectedEnv.variables}
                  onChange={(vars) => handleUpdateEnvVars(selectedEnv.id, vars)}
                  keyPlaceholder="VAR_NAME"
                  valuePlaceholder="value"
                />
              </div>
            ) : (
              <div className="border border-dashed border-rack-border bg-rack-surface p-6 text-center font-mono text-xs text-rack-dim">
                No environments configured. Create one using the form on the left.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
