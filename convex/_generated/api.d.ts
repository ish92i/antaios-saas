/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as app from "../app.js";
import type * as audit from "../audit.js";
import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as dds from "../dds.js";
import type * as documents from "../documents.js";
import type * as dodo from "../dodo.js";
import type * as email_index from "../email/index.js";
import type * as email_templates_antaios_theme from "../email/templates/antaios_theme.js";
import type * as email_templates_components_AntaiosLayout from "../email/templates/components/AntaiosLayout.js";
import type * as email_templates_subscription from "../email/templates/subscription.js";
import type * as email_templates_supplier from "../email/templates/supplier.js";
import type * as env from "../env.js";
import type * as extract from "../extract.js";
import type * as extractOcr from "../extractOcr.js";
import type * as geo from "../geo.js";
import type * as http from "../http.js";
import type * as lib_completeness from "../lib/completeness.js";
import type * as lib_gfw from "../lib/gfw.js";
import type * as lib_litellm from "../lib/litellm.js";
import type * as lib_translate from "../lib/translate.js";
import type * as lib_validators from "../lib/validators.js";
import type * as merge from "../merge.js";
import type * as orgs from "../orgs.js";
import type * as payments from "../payments.js";
import type * as pdf from "../pdf.js";
import type * as scan from "../scan.js";
import type * as shipments from "../shipments.js";
import type * as supplier from "../supplier.js";
import type * as supplier_email from "../supplier_email.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  app: typeof app;
  audit: typeof audit;
  auth: typeof auth;
  crons: typeof crons;
  dds: typeof dds;
  documents: typeof documents;
  dodo: typeof dodo;
  "email/index": typeof email_index;
  "email/templates/antaios_theme": typeof email_templates_antaios_theme;
  "email/templates/components/AntaiosLayout": typeof email_templates_components_AntaiosLayout;
  "email/templates/subscription": typeof email_templates_subscription;
  "email/templates/supplier": typeof email_templates_supplier;
  env: typeof env;
  extract: typeof extract;
  extractOcr: typeof extractOcr;
  geo: typeof geo;
  http: typeof http;
  "lib/completeness": typeof lib_completeness;
  "lib/gfw": typeof lib_gfw;
  "lib/litellm": typeof lib_litellm;
  "lib/translate": typeof lib_translate;
  "lib/validators": typeof lib_validators;
  merge: typeof merge;
  orgs: typeof orgs;
  payments: typeof payments;
  pdf: typeof pdf;
  scan: typeof scan;
  shipments: typeof shipments;
  supplier: typeof supplier;
  supplier_email: typeof supplier_email;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  dodopayments: import("@dodopayments/convex/_generated/component.js").ComponentApi<"dodopayments">;
};
