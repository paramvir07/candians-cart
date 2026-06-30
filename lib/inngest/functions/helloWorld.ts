import { inngest } from "../inngest";


export const helloWorld = inngest.createFunction(
  {
    id: "hello-world",
    triggers: { event: "test/hello" },
  },
  async ({ event, step }) => {
    return { message: "it works", data: event.data };
  }
);