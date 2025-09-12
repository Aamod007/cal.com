import Link from "next/link";
import { Toaster } from "sonner";

import AppNotInstalledMessage from "@calcom/app-store/_components/AppNotInstalledMessage";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Button } from "@calcom/ui/components/button";

const UMAMI = "umami";

export default function UmamiSetup() {
  const { t } = useLocale();
  const integrations = trpc.viewer.apps.integrations.useQuery({ variant: "analytics" });

  const umamiCredentials = integrations.data?.items.find(
    (item: { type: string }) => item.type === "umami_analytics"
  );
  const [credentialId] = umamiCredentials?.userCredentialIds || [false];
  const showContent = integrations.data && integrations.isSuccess && credentialId;

  if (integrations.isPending) {
    return <div className="bg-emphasis absolute z-50 flex h-screen w-full items-center" />;
  }

  return (
    <div className="bg-emphasis flex h-screen">
      {showContent ? (
        <div className="bg-default m-auto max-w-[43em] overflow-auto rounded pb-10 md:p-10">
          <div className="md:flex md:flex-row">
            <div className="invisible md:visible">
              <img className="h-11" src="/api/app-store/umami/icon.svg" alt="Umami Logo" />
            </div>
            <div className="ml-2 ltr:mr-2 rtl:ml-2 md:ml-5">
              <div className="text-default">Setting up Umami</div>
              <div className="mt-1 text-xl">Configure Umami Analytics</div>
              
              <div className="mt-4 space-y-4">
                <div className="text-sm">
                  <p className="mb-2">
                    Umami is a privacy-focused analytics tool that helps you understand your website traffic 
                    without compromising visitor privacy.
                  </p>
                  
                  <p className="mb-2">
                    To set up Umami with your Cal.com booking pages, you'll need:
                  </p>
                  
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Script URL:</strong> The URL to your Umami tracking script (e.g., https://your-umami-instance.com/script.js)</li>
                    <li><strong>Site ID:</strong> The unique identifier for your website in Umami</li>
                  </ul>
                </div>

                <div className="bg-subtle p-4 rounded-md">
                  <h3 className="font-semibold mb-2">How to find your Umami configuration:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Log into your Umami dashboard</li>
                    <li>Go to Settings &gt; Websites</li>
                    <li>Click on your website</li>
                    <li>Copy the tracking code - you'll find both the script URL and data-website-id there</li>
                  </ol>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
                  <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
                  <p className="text-blue-800 text-sm">
                    After getting your configuration details, go to your Event Types and enable 
                    the Umami app for each event type you want to track.
                  </p>
                </div>
              </div>

              <Link href="/apps/installed/analytics?hl=umami" passHref={true} legacyBehavior>
                <Button color="secondary" className="mt-6">{t("done")}</Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <AppNotInstalledMessage appName="umami" />
      )}
      <Toaster position="bottom-right" />
    </div>
  );
}