import ImageKit from "imagekit";
import dotenv from "dotenv";
dotenv.config();

const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

export const imageKit = new ImageKit({
  publicKey: publicKey as string,
  privateKey: privateKey as string,
  urlEndpoint: `${process.env.IMAGEKIT_URL_ENDPOINT}`,
});
