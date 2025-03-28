import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ||'dzwwlfawn', 
    api_key: process.env.CLOUDINARY_API_KEY||'699859448565493', 
    api_secret: process.env.CLOUDINARY_API_SECRET ||'pMyWgBryiOrlsO8Emy5w1AxbAWk'
  });

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null;
    }
}



export default uploadOnCloudinary