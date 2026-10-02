// Single place to change brand and links.
export default {
  name: "Rooster",
  domain: "therooster.farm",
  // Served under a subpath? (GitHub Pages project sites are /<repo>). Leave "" when served at the domain root.
  basePath: "",
  tagline: "Wake up to customers.",
  description: "Rooster runs your reviews, Google profile, social posts and win-back texts overnight. You approve everything from your phone in 15 minutes each morning.",
  // Paste your Calendly link here. Every "Book a demo" button uses it.
  calendlyUrl: "https://calendly.com/YOUR-LINK",
  // Where "Start free" goes: the Rooster app (demo mode), built from the app repo into public/app/.
  // The pilot signup form stays at /start/.
  signupUrl: "/app/",
  supportEmail: "hello@rooster.example",
  // Optional: a Formspree/Basin-style endpoint for the contact + pilot forms. Leave empty to fall back to mailto.
  formEndpoint: "",
  port: 4321,
};
