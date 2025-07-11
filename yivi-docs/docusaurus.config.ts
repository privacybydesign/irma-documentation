import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "Yivi docs",
  tagline: "Privacy first ID-wallet",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://docs.yivi.app",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "Yivi", // Usually your GitHub org/user name.
  projectName: "irma-documentation", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/",
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
          sidebarPath: "./sidebars.ts",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/privacybydesign/irma-documentation/tree/master/yivi-docs/",
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/privacybydesign/irma-documentation/tree/master/yivi-docs/",
          // Useful options to enforce blogging best practices
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "warn",
          blogSidebarCount: "ALL",
        },
        theme: {
          customCss: ["./src/css/custom.css", "/katex/katex.min.css"],
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: "Yivi docs",
      logo: {
        alt: "Yivi logo",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "documentationSidebar",
          position: "left",
          label: "Documentation",
        },
        { to: "/blog", label: "Blog", position: "left" },
        {
          href: "https://attribute-index.yivi.app/en/",
          label: "Attribute Index",
          position: "right",
        },
        {
          href: "https://github.com/privacybydesign",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "What is Yivi",
              to: "/what-is-yivi",
            },
            {
              label: "Getting started",
              to: "/getting-started",
            },
            {
              label: "Technical overview",
              to: "/technical-overview",
            },
            {
              label: "Trusted Verifier",
              to: "/trusted-verifier",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/orgs/privacybydesign",
            },
            {
              label: "LinkedIn",
              href: "https://www.linkedin.com/company/yivi-app",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "Blog",
              to: "/blog",
            },

            {
              label: "Privacy By Design",
              href: "https://privacybydesign.foundation/",
            },
            {
              label: "Caesar Groep",
              href: "https://caesar.nl",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Yivi, Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    stylesheets: [
      {
        href: "/katex/katex.min.css",
        type: "text/css",
      },
    ],
  } satisfies Preset.ThemeConfig,
};

export default config;
