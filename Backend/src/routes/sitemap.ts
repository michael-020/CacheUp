import { Request, Response, Router } from "express";
import { FRONTEND_URL } from "../config";
import { forumModel, postForumModel, threadForumModel, userModel } from "../models/db";

const router = Router()

router.get("/sitemap.xml", async (req: Request, res: Response) => {
    try {
        const staticRoutes = [
            `${FRONTEND_URL}/`,
            `${FRONTEND_URL}/signup`,
            `${FRONTEND_URL}/set-up-account`,
            `${FRONTEND_URL}/signin`,
            `${FRONTEND_URL}/verify-email`,
            `${FRONTEND_URL}/profile`,
            `${FRONTEND_URL}/message`,
            `${FRONTEND_URL}/edit-profile`,
            `${FRONTEND_URL}/friends`,
            `${FRONTEND_URL}/settings`,
            `${FRONTEND_URL}/home`,
            `${FRONTEND_URL}/change-password`,
            `${FRONTEND_URL}/saved-posts`,
            `${FRONTEND_URL}/forums/get-forums`,
            `${FRONTEND_URL}/forums/search?q=rap`,
            `${FRONTEND_URL}/forums/search?q=media`,
            `${FRONTEND_URL}/forums/search?q=movies`,
            `${FRONTEND_URL}/forums/search?q=web%20series`,
            `${FRONTEND_URL}/forums/search?q=eminem`,
            `${FRONTEND_URL}/forums/search?q=anime`,
            `${FRONTEND_URL}/forums/search?q=news`,
            `${FRONTEND_URL}/forums/search?q=carrer`,
            `${FRONTEND_URL}/forums/search?q=diet`,
            `${FRONTEND_URL}/forums/search?q=fitness`,
            `${FRONTEND_URL}/forums/search?q=workout`,
            `${FRONTEND_URL}/forums/search?q=politics`,
            `${FRONTEND_URL}/forums/search?q=scam`,
            `${FRONTEND_URL}/forums/search?q=monorepo`,
            `${FRONTEND_URL}/forums/search?q=nextjs`,
            `${FRONTEND_URL}/forums/search?q=mern%20stack`,
            `${FRONTEND_URL}/forums/search?q=podcast`,
            `${FRONTEND_URL}/forums/search?q=hiphop`,
            `${FRONTEND_URL}/forums/search?q=rap%20beef`,
            `${FRONTEND_URL}/forums/search?q=hacking`,
            `${FRONTEND_URL}/forums/search?q=artificial%20intelligence`,
            `${FRONTEND_URL}/forums/search?q=devices`,
            `${FRONTEND_URL}/forums/search?q=mobiles`,
            `${FRONTEND_URL}/forums/search?q=gadgets`,
            `${FRONTEND_URL}/forums/search?q=code`,
            `${FRONTEND_URL}/forums/search?q=predictions`,
            `${FRONTEND_URL}/forums/search?q=claude%20sonnet$204`,
            `${FRONTEND_URL}/forums/search?q=aiml`,
            `${FRONTEND_URL}/forums/search?q=data%20science`,
            `${FRONTEND_URL}/forums/search?q=imdb`,
            `${FRONTEND_URL}/forums/search?q=must%20watch`,
            `${FRONTEND_URL}/forums/search?q=rap%20verces`,
            `${FRONTEND_URL}/forums/search?q=oscar%20winners`,
            `${FRONTEND_URL}/forums/search?q=bias%20media`,
            `${FRONTEND_URL}/forums/search?q=nigga`,
            `${FRONTEND_URL}/forums/search?q=rap%20bars`,
            `${FRONTEND_URL}/forums/search?q=vijay%20mallya`,
        ]

        const staticUrls = staticRoutes.map((route) => {
            return `
        <url>
          <loc>${route}</loc>
          <changefreq>weekly</changefreq>
          <priority>0.7</priority>
        </url>`;
        });

        const [forums, profiles, threads] = await Promise.all([
            forumModel.find({ visibility: true }, "_id weaviateId"),
            userModel.find({}),
            threadForumModel.find({ visibility: true }, "_id")
          ]);

        const forumUrls = forums.map((forum) => {
            return `
        <url>
          <loc>${FRONTEND_URL}/forums/${forum._id}/${forum.weaviateId}</loc>
          <changefreq>daily</changefreq>
          <priority>0.8</priority>
        </url>`;
        });

        const threadUrls: string[] = []
        for (const thread of threads) {
            const postCount = await postForumModel.countDocuments({ threadId: thread._id });
            const totalPages = Math.ceil(postCount / 10) || 1;

            for (let page = 1; page <= totalPages; page++) {
                threadUrls.push(`
        <url>
          <loc>${FRONTEND_URL}/forums/thread/${thread._id}/${page}</loc>
          <changefreq>daily</changefreq>
          <priority>0.9</priority>
        </url>`);
            }
        }

        const profileUrls = profiles.map((user) => {
            return `
        <url>
          <loc>${FRONTEND_URL}/profile/${user._id}</loc>
          <changefreq>monthly</changefreq>
          <priority>0.6</priority>
        </url>`;
        });

        const allUrls = [...staticUrls, ...forumUrls, ...threadUrls, ...profileUrls].join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
            <urlset
                xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                ${allUrls}
            </urlset>`;

        res.set("Content-Type", "application/xml");
        res.status(200).send(xml);
    } catch (error) {

    }
})

export default router;