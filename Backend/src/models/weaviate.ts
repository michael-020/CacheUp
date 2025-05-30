import dotenv from "dotenv";
dotenv.config();
import weaviate from "weaviate-ts-client";

const weaviateURL = process.env.WEAVIATE_HOST as string;

export const weaviateClient = weaviate.client({
  scheme:'http',
  host: weaviateURL.replace(/^http?:\/\//, '')
});

export async function setupWeaviateSchema() {
  const schema = await weaviateClient.schema.getter().do();

  if (!schema || !schema.classes?.find((c) => c.class === "Forum")) {
    await weaviateClient.schema.classCreator().withClass({
      class: "Forum",
      vectorizer: "none",
      invertedIndexConfig: {
        indexNullState: true
      },
      properties: [
        { name: "title", dataType: ["string"] },
        { name: "description", dataType: ["string"] },
        { name: "vector", dataType: ["number[]"] },
        { name: "mongoId", dataType: ["string"], required: true },
        { 
          name: "isBackedUp", 
          dataType: ["boolean"], 
          defaultValue: false
        }
      ],
    }).do();
  }

  if (!schema.classes?.find((c) => c.class === "Thread")) {
    await weaviateClient.schema.classCreator().withClass({
      class: "Thread",
      vectorizer: "none",
      invertedIndexConfig: {
        indexNullState: true
      },
      properties: [
        { name: "title", dataType: ["string"] },
        { name: "description", dataType: ["string"] },
        { name: "mongoId", dataType: ["string"], required: true },
        { name: "vector", dataType: ["number[]"] },
        { 
          name: "isBackedUp", 
          dataType: ["boolean"], 
          defaultValue: false
        }
      ],
    }).do();
  }

  if (!schema.classes?.find((c) => c.class === "Post")) {
    await weaviateClient.schema.classCreator().withClass({
      class: "Post",
      vectorizer: "none",
      invertedIndexConfig: {
        indexNullState: true
      },
      properties: [
        { name: "content", dataType: ["string"] },
        { name: "mongoId", dataType: ["string"], required: true },
        { name: "vector", dataType: ["number[]"] },
        { 
          name: "isBackedUp", 
          dataType: ["boolean"], 
          defaultValue: false
        }
      ],
    }).do();
  }

  if (!schema.classes?.find((c) => c.class === "Comment")) {
    await weaviateClient.schema.classCreator().withClass({
      class: "Comment",
      vectorizer: "none",
      invertedIndexConfig: {
        indexNullState: true
      },
      properties: [
        { name: "content", dataType: ["string"] },
        { name: "mongoId", dataType: ["string"], required: true },
        { name: "vector", dataType: ["number[]"] },
        { 
          name: "isBackedUp", 
          dataType: ["boolean"], 
          defaultValue: false
        }
      ],
    }).do();
  }

  console.log("✅ Weaviate schema set up!");
}
