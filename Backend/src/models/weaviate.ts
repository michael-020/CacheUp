import dotenv from "dotenv";
dotenv.config();
import weaviate from "weaviate-ts-client";

const weaviateURL = process.env.WEAVIATE_HOST as string;

console.log('Weaviate Host:', process.env.WEAVIATE_HOST);
console.log('Weaviate API Key present:', !!process.env.WEAVIATE_API_KEY);



export const weaviateClient = weaviate.client({
  scheme:'http',
  host: weaviateURL.replace(/^http?:\/\//, '')
});

export async function setupWeaviateSchema() {
  const schema = await weaviateClient.schema.getter().do();

  if (!schema || !schema.classes?.find((c) => c.class === "Forum")) {
    await weaviateClient.schema.classCreator().withClass({
      class: "Forum",
      vectorizer: "none", // We provide vectors manually
      properties: [
        { name: "title", dataType: ["string"] },
        { name: "description", dataType: ["string"] },
        { name: "vector", dataType: ["number[]"] }, // Store embeddings
        { name: "mongoId", dataType: ["string"]}
      ],
    }).do();
  }

  if (!schema.classes?.find((c) => c.class === "Thread")) {
    await weaviateClient.schema.classCreator().withClass({
      class: "Thread",
      vectorizer: "none",
      properties: [
        { name: "title", dataType: ["string"] },
        { name: "description", dataType: ["string"]},
        { name: "forum", dataType: ["Forum"] }, // Links to a forum
        { name: "vector", dataType: ["number[]"] },
        { name: "mongoId", dataType: ["string"]}
      ],
    }).do();
  }

  if (!schema.classes?.find((c) => c.class === "Post")) {
    await weaviateClient.schema.classCreator().withClass({
      class: "Post",
      vectorizer: "none",
      properties: [
        { name: "content", dataType: ["string"] },
        { name: "thread", dataType: ["Thread"] },
        { name: "vector", dataType: ["number[]"] },
        { name: "mongoId", dataType: ["string"]}
      ],
    }).do();
  }

  if (!schema.classes?.find((c) => c.class === "Comment")) {
    await weaviateClient.schema.classCreator().withClass({
      class: "Comment",
      vectorizer: "none",
      properties: [
        { name: "content", dataType: ["string"] },
        { name: "post", dataType: ["Post"] },
        { name: "vector", dataType: ["number[]"] },
        { name: "mongoId", dataType: ["string"]}
      ],
    }).do();
  }

  console.log("✅ Weaviate schema set up!");
}
