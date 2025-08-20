import * as Sentry from "@sentry/node"
Sentry.init({
    dsn: "https://6aa22c8fa38899c2028f2bcde831ddd8@o4509870787133440.ingest.us.sentry.io/4509870798405632",
    integrations: [Sentry.mongooseIntegration()],
    sendDefaultPii: true,
});