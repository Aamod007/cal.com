"use client";

import { useMemo, useState } from "react";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import classNames from "@calcom/ui/classNames";
import { Button } from "@calcom/ui/components/button";
import { Icon } from "@calcom/ui/components/icon";

// All plans are billed in euros for the affected (EU) locales. Keeping a single
// currency here is what fixes the "$ shown instead of €" reports in the issue.
const CURRENCY = "EUR";
const ANNUAL_DISCOUNT_PERCENT = 20;

type PlanId = "teams" | "organizations" | "enterprise";

type Plan = {
  id: PlanId;
  /** Monthly price per seat in euros. `null` means a custom / quote-based price. */
  monthlyPrice: number | null;
  nameKey: string;
  descriptionKey: string;
  highlighted?: boolean;
  ctaKey: string;
};

// Distinct, per-plan prices. The issue reported every plan collapsing to the
// same value (all €15 / both $12) — these are intentionally different.
const PLANS: Plan[] = [
  {
    id: "teams",
    monthlyPrice: 12,
    nameKey: "pricing_plan_teams",
    descriptionKey: "pricing_plan_teams_description",
    ctaKey: "pricing_get_started",
  },
  {
    id: "organizations",
    monthlyPrice: 37,
    nameKey: "pricing_plan_organizations",
    descriptionKey: "pricing_plan_organizations_description",
    highlighted: true,
    ctaKey: "pricing_get_started",
  },
  {
    id: "enterprise",
    monthlyPrice: null,
    nameKey: "pricing_plan_enterprise",
    descriptionKey: "pricing_plan_enterprise_description",
    ctaKey: "pricing_contact_sales",
  },
];

const FEATURES: { labelKey: string; availability: Record<PlanId, boolean> }[] = [
  {
    labelKey: "pricing_feature_event_types",
    availability: { teams: true, organizations: true, enterprise: true },
  },
  {
    labelKey: "pricing_feature_team_scheduling",
    availability: { teams: true, organizations: true, enterprise: true },
  },
  {
    labelKey: "pricing_feature_round_robin",
    availability: { teams: true, organizations: true, enterprise: true },
  },
  {
    labelKey: "pricing_feature_managed_users",
    availability: { teams: false, organizations: true, enterprise: true },
  },
  {
    labelKey: "pricing_feature_admin_api",
    availability: { teams: false, organizations: true, enterprise: true },
  },
  {
    labelKey: "pricing_feature_priority_support",
    availability: { teams: false, organizations: true, enterprise: true },
  },
  {
    labelKey: "pricing_feature_sla",
    availability: { teams: false, organizations: false, enterprise: true },
  },
];

export default function PricingView() {
  const { t, i18n } = useLocale();
  const [annual, setAnnual] = useState(true);

  // Locale-aware currency formatter. Using the active language as the locale is
  // what produces "12,00 €" in de/fr and "€12.00" in en rather than a hardcoded
  // "$" prefix.
  const formatPrice = useMemo(() => {
    const formatter = new Intl.NumberFormat(i18n.language || "en", {
      style: "currency",
      currency: CURRENCY,
      maximumFractionDigits: 0,
    });
    return (value: number) => formatter.format(value);
  }, [i18n.language]);

  const priceFor = (plan: Plan) => {
    if (plan.monthlyPrice === null) return t("pricing_custom_price");
    const value = annual
      ? Math.round(plan.monthlyPrice * (1 - ANNUAL_DISCOUNT_PERCENT / 100))
      : plan.monthlyPrice;
    return formatPrice(value);
  };

  return (
    <div className="bg-default mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-emphasis text-3xl font-bold tracking-tight sm:text-4xl">
          {t("pricing_page_title")}
        </h1>
        <p className="text-subtle mx-auto mt-3 max-w-2xl text-base">{t("pricing_page_subtitle")}</p>
      </div>

      {/* Billing period toggle */}
      <div className="mt-8 flex items-center justify-center gap-3">
        <span
          className={classNames(
            "text-sm font-medium",
            annual ? "text-subtle" : "text-emphasis"
          )}>
          {t("pricing_billed_monthly")}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={annual}
          aria-label={t("pricing_billed_annually")}
          onClick={() => setAnnual((value) => !value)}
          className={classNames(
            "relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors",
            annual ? "bg-inverted" : "bg-emphasis"
          )}>
          <span
            className={classNames(
              "bg-default inline-block h-5 w-5 translate-y-0.5 rounded-full transition-transform",
              annual ? "translate-x-5" : "translate-x-0.5"
            )}
          />
        </button>
        <span
          className={classNames(
            "text-sm font-medium",
            annual ? "text-emphasis" : "text-subtle"
          )}>
          {t("pricing_billed_annually")}
        </span>
        {/* Sale badge: no fixed width and `whitespace-nowrap` so the longer
            localized strings (e.g. "Économisez 20 %") are never clipped. */}
        <span className="bg-success text-success inline-flex h-6 items-center whitespace-nowrap rounded-full px-3 text-xs font-semibold">
          {t("pricing_save_percentage", { percent: ANNUAL_DISCOUNT_PERCENT })}
        </span>
      </div>

      {/* Plan cards */}
      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={classNames(
              "border-subtle bg-default relative flex flex-col rounded-2xl border p-6",
              plan.highlighted && "border-emphasis ring-emphasis shadow-sm ring-1"
            )}>
            {plan.highlighted && (
              <span className="bg-inverted text-inverted absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold">
                {t("pricing_most_popular")}
              </span>
            )}
            <h2 className="text-emphasis text-xl font-semibold">{t(plan.nameKey)}</h2>
            <p className="text-subtle mt-2 min-h-[3rem] text-sm">{t(plan.descriptionKey)}</p>
            <div className="mt-4 flex flex-wrap items-baseline gap-x-2">
              <span className="text-emphasis text-3xl font-bold">{priceFor(plan)}</span>
              {plan.monthlyPrice !== null && (
                <span className="text-subtle whitespace-nowrap text-sm">
                  {t("pricing_per_seat_month")}
                </span>
              )}
            </div>
            <Button
              color={plan.highlighted ? "primary" : "secondary"}
              className="mt-6 justify-center"
              href={plan.id === "enterprise" ? "https://go.cal.com/quote" : "/signup"}>
              {t(plan.ctaKey)}
            </Button>
          </div>
        ))}
      </div>

      {/* Feature breakdown */}
      <div className="mt-16">
        <h2 className="text-emphasis text-2xl font-bold">{t("pricing_feature_breakdown")}</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-left">
            <thead>
              <tr className="border-subtle border-b">
                <th className="text-subtle py-3 pr-4 text-sm font-medium" />
                {PLANS.map((plan) => (
                  <th
                    key={plan.id}
                    className="text-emphasis whitespace-nowrap px-4 py-3 text-center text-sm font-semibold">
                    {t(plan.nameKey)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feature) => (
                <tr key={feature.labelKey} className="border-subtle border-b">
                  <td className="text-default py-3 pr-4 text-sm">{t(feature.labelKey)}</td>
                  {PLANS.map((plan) => (
                    <td key={plan.id} className="px-4 py-3 text-center">
                      {feature.availability[plan.id] ? (
                        <Icon name="check" className="text-success mx-auto h-5 w-5" />
                      ) : (
                        <Icon name="x" className="text-muted mx-auto h-5 w-5" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
