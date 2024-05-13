# RTC Map Tool
RTC Map Tool is the website that visualizes the support for these three pieces of legislation from both grassroots and elected leadership: Statewide Support for Housing Courts Must Change! Campaign: [hcmustchange.beta.nyc.](https://hcmustchange.beta.nyc/?_gl=1*k0170f*_ga*MTEzMDc3NzIxOC4xNjkwODIwMzQz*_ga_HF010MPRW7*MTcxNTU3NjQ0Ni4xOC4xLjE3MTU1NzY0ODAuMC4wLjA.) 

The website allows viewers to:
- Visualize the districts of state legislators, including the counties and zip codes their districts cover; learn which pieces of legislation on the HCMC platform they support; and contact their legislators to advocate for the legislation. 
- Visualize where Right to Counsel member and endorser organizations are located throughout the state; see which legislation they support; and get in touch with them.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Deploy on GitHub Pages

Make sure to add the [nextjs.yml](https://github.com/BetaNYC/nys-rtc/blob/main/.github/workflows/nextjs.yml) in the .github/ workflows doc path

### In the next config.js file please add:  
    const nextConfig = {
      trailingSlash: true,
      output: "export",
    };

module.exports = nextConfig;

Push your changes from the local file and the GitHub Action will automatically run the deployment

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!


