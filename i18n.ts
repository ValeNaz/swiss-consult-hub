import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const SUPPORTED_LNGS = ['it', 'en', 'fr', 'de'] as const;

type SupportedLang = typeof SUPPORTED_LNGS[number];

type ResourcesMap = {
  [lng: string]: {
    [ns: string]: any;
  };
};

function buildResources(): ResourcesMap {
  const modules = import.meta.glob('./locales/**/*.json', {
    eager: true,
    import: 'default',
  }) as Record<string, any>;

  const resources: ResourcesMap = {};

  const paths = Object.keys(modules);
  const aggregatedNs = new Set<string>();

  // Pass 1: detect namespaces that have an aggregated file with language buckets
  paths.forEach((path) => {
    const data = modules[path];
    const parts = path.split('/');
    const fileName = parts[parts.length - 1];
    const ns = fileName.replace('.json', '');
    const localesIdx = parts.findIndex((p) => p === 'locales');
    const maybeLng = parts[localesIdx + 1];
    const isAggregated = !SUPPORTED_LNGS.includes(maybeLng as SupportedLang);
    if (isAggregated) {
      // Consider aggregated only if it actually contains at least one supported language key
      const hasLngBuckets = SUPPORTED_LNGS.some((lng) => data && typeof data === 'object' && data[lng]);
      if (hasLngBuckets) aggregatedNs.add(ns);
    }
  });

  // Pass 2: build resources, preferring aggregated over per-language files for the same namespace
  paths.forEach((path) => {
    const data = modules[path];
    const parts = path.split('/');
    const fileName = parts[parts.length - 1];
    const ns = fileName.replace('.json', '');
    const localesIdx = parts.findIndex((p) => p === 'locales');
    const maybeLng = parts[localesIdx + 1];
    const isAggregated = !SUPPORTED_LNGS.includes(maybeLng as SupportedLang);

    if (isAggregated) {
      SUPPORTED_LNGS.forEach((lng) => {
        const nsData = data?.[lng] || {};
        if (!resources[lng]) resources[lng] = {};
        resources[lng][ns] = {
          ...(resources[lng][ns] || {}),
          ...nsData,
        };
      });
    } else {
      const lng = maybeLng as SupportedLang;
      if (!SUPPORTED_LNGS.includes(lng)) return;
      // Skip per-language file if an aggregated file for this namespace exists
      if (aggregatedNs.has(ns)) return;
      if (!resources[lng]) resources[lng] = {};
      resources[lng][ns] = {
        ...(resources[lng][ns] || {}),
        ...data,
      };
    }
  });

  return resources;
}

const resources = buildResources();

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'it',
    supportedLngs: SUPPORTED_LNGS as unknown as string[],
    defaultNS: 'common',
    ns: undefined, // auto from resources
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    returnNull: false,
    debug: import.meta.env.DEV,
  });

export default i18n;
