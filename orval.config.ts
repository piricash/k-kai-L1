import { defineConfig } from "orval";

export default defineConfig({
  kakarikiKai: {
    input: { target: "./openapi/kakariki-kai.json" },
    output: {
      client: "axios",
      clean: true,
      mode: "single",
      target: "./client/src/api/generated/kakarikiKai.ts",
    },
  },
});
