import { Request, Response } from "express";
import { weaviateClient } from "../../models/weaviate";
import { commentForumModel, forumModel, postForumModel, threadForumModel } from "../../models/db";
import { z } from "zod";
import { embedtext } from "../../lib/vectorizeText";


const queryWeaviate = async (query: number[]) => {
    try{
        const fetchIds = await Promise.all([
            weaviateClient.graphql.get()
                .withClassName("Forum")
                .withFields("mongoId _additional { certainty }")
                .withNearVector({vector: query})
                .withLimit(2)
                .do(),
            weaviateClient.graphql.get()
                .withClassName("Thread")
                .withFields("mongoId _additional { certainty }")
                .withNearVector({vector: query})
                .withLimit(5)
                .do(),
            weaviateClient.graphql.get()
                .withClassName("Post")
                .withFields("mongoId _additional { certainty }")
                .withNearVector({vector: query})
                .withLimit(10)
                .do(),
            weaviateClient.graphql.get()
                .withClassName("Comment")
                .withFields("mongoId _additional { certainty }")
                .withNearVector({vector: query})
                .withLimit(10)
                .do()
        ]) 

        const results: Array<{
            type: string;
            mongoId: string;
            certainty: number;
        }> = []

        fetchIds.forEach((res, index) => {
            const type = ["Forum", "Thread", "Post", "Comment"][index];
      
            if (res.data.Get && res.data.Get[type]) {
                res.data.Get[type].forEach((item: any) => {
                    if (item.mongoId && item.mongoId !== "null") { // ✅ Filter out null values
                        results.push({
                            type,
                            mongoId: item.mongoId,
                            certainty: item._additional.certainty
                        });
                    }
                });
            }
          });
          
          // Sort by relevance (certainty)
          results.sort((a, b) => b.certainty - a.certainty);
          return results;
    }catch(e){
        console.error("weaviate error",e)
    }
} 

const queryMongo = async (searchAlgoResult: Array<{
    type: string;
    mongoId: string;
    certainty: number;
}>) => {
    try{
        const finalResults: any[] = [];

        for(const item of searchAlgoResult) {
            const objectId = item.mongoId;

            let data;

            switch(item.type){
                case "Forum":
                    data = await forumModel.findById(objectId)
                    break;
                case "Thread":
                    data = await threadForumModel.findById(objectId)
                    break;
                case "Post": 
                    data = await postForumModel.findById(objectId)
                    break;
                case "Comment": 
                    const postId = await commentForumModel.findById(objectId).select("post")
                    data = await postForumModel.findById(postId)
                    break;
                default:
                    continue;
            }

            if(data){
                finalResults.push({
                    type: item.type,
                    data: data.toObject(),
                    certainty: item.certainty
                })
            }
        }
        return finalResults
    }catch(e){
        console.error("mongodb error",e)
    }
}

export const searchForumHandler = async (req: Request, res: Response) => {
    const searchSchema = z.object({
        query: z.string().min(3)
    })
    try{
        const response = searchSchema.safeParse(req.params)
        if(!response.success) {
            res.status(411).json({
                msg: "Query should be atleast 4 characters long"
            })
            return;
        }
        const { query } = req.params
        const queryEmbeddings = await embedtext(query);
        const queryWeaviateResults = await queryWeaviate(queryEmbeddings);
        if (queryWeaviateResults == null) {
            res.status(200).json({
                success: true,
                message: "No results found",
                data: []
            });
            return
        }
        const searchResults = await queryMongo(queryWeaviateResults)

        res.json({
            msg: "Query Successfull",
            searchResults
        })
    }catch(e){
        console.error(e)
        res.status(500).json({
            msg: "Server Error"
        })
    }
}