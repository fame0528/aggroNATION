export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Aggronation",
  description: "AI News Aggregator - Curated news from RSS, Reddit, YouTube, and X",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "About",
      href: "/about",
    },
  ],
  navMenuItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "About",
      href: "/about",
    },
  ],
  links: {
    github: "https://github.com/fame0528/aggronation",
    twitter: "https://twitter.com/aggronation",
    docs: "https://github.com/fame0528/aggronation#readme",
    discord: "",
    sponsor: "",
  },
};
