import { _generateMetadata } from "app/_utils";

import PricingView from "~/pricing/pricing-view";

export const generateMetadata = async () =>
  await _generateMetadata(
    (t) => t("pricing_page_title"),
    (t) => t("pricing_page_subtitle"),
    undefined,
    undefined,
    "/pricing"
  );

const ServerPageWrapper = async () => {
  return <PricingView />;
};

export default ServerPageWrapper;
