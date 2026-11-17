import React from "react";
import Footer from "@theme-original/DocItem/Footer";
import type FooterType from "@theme/DocItem/Footer";
import type { WrapperProps } from "@docusaurus/types";
import { useDoc, useDocsVersion } from "@docusaurus/plugin-content-docs/client";
import SourceNotice from "@site/src/components/EdiStelsel/SourceNotice";

type Props = WrapperProps<typeof FooterType>;

/**
 * Adds the source of the scheme documents under every page of the EDI-stelsel section, except the
 * introduction page, which shows the full notice.
 */
export default function FooterWrapper(props: Props): JSX.Element {
  const { pluginId } = useDocsVersion();
  const { metadata } = useDoc();
  return (
    <>
      {pluginId === "edi-stelsel" && metadata.id !== "index" && <SourceNotice compact />}
      <Footer {...props} />
    </>
  );
}
