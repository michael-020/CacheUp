import sharp from "sharp"


export const convertImageToWebP = async (imageBase64: string) => {
    const matches = imageBase64.match(/^data:image\/([a-zA-Z0-9.-]+);base64,(.+)$/)
    if(!matches || matches.length !== 3){
        throw new Error("Invalid image format")
    }

    const imageType = matches[1]
    const imageBuffer = Buffer.from(matches[2],'base64')

    try {
        return await sharp(imageBuffer, {failOnError: false})
            .rotate()
            .webp({ quality: 80 })
            .toBuffer()
    } catch (error) {
        try {
            return await sharp(imageBuffer, { failOnError: false, raw: imageType.toLowerCase() == 'dng' ? { width: 1000, height: 1000, channels:3 }: undefined})
                .rotate()
                .webp({ quality: 70 })
                .toBuffer()
        } catch (error) {
            throw new Error(error as string)          
        }
    }

}

