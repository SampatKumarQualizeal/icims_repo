// config/secrets/secrets.template.ts
// Committed skeleton — DO NOT put real secrets here.
// Copy this to config/secrets/secrets.local.ts and fill values, or use env vars in CI.

export const secrets = {
  ats: {
    uiUser: "",
    uiPass: "",

    apiAdminUser: "",
    apiAdminPassword: "",

    roleCredentials: {
      recruiter: {
        username: "",
        password: ""
      },
      manager: {
        username: "",
        password: ""
      },
      admin: {
        username: "",
        password: ""
      }
    }
  },
  crm: {
    username: "",
    password: "!"
  },
  cst: {},

  slackWebhook: "",
  teamsWebhook: "",

  ldSdkKey: "",
  ldWriteKey: "",

  twilioApiKey: "",
  cmsApiKey: "",

  miscTokens: {}
};
