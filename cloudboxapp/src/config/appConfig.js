function getRequiredEnvVar(name) {
  const value = import.meta.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const apiUrl = getRequiredEnvVar('VITE_API_URL');
