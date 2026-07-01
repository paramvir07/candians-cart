import { inngestClient } from "../inngest";


export const helloWorld = inngestClient.createFunction(
  {
    id: "hello-world",
    triggers: { event: "test/hello" },
  },
  async ({ event, step }) => {
    return { message: "it works", data: event.data };
  }
);

export const generateGeminiImage = inngestClient.createFunction({
    id:"generate-image-gemini",
    triggers:{event:"product/image-generate"}
},
async ({event})=>{
    console.log(event)
    return {message:"Got Image Data",data:event.data}
}
)