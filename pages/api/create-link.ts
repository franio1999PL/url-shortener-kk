import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../../mongodb";
import { customAlphabet } from "nanoid";
import { COLLECTION_NAMES } from "../../types";
import Cors from 'cors'

import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const getHash = customAlphabet(characters, 4);

// Inicjalizacja middleware CORS
const cors = Cors({
  methods: ['GET', 'POST'],
});

export default async function CreateLink(
  request: NextApiRequest,
  response: NextApiResponse
) {
  // Wywołanie middleware CORS
  await cors(request, response, error => {console.log("error:", error);});

  const apiKey = request.headers["api-key"] as string;
  if (request.method !== "POST") {
    return response.status(405).json({
      type: "Error",
      code: 405,
      message: "Only POST method is accepted on this route",
    });
  }
  if(apiKey !== process.env.API_KEY){
    return response.status(403).json({
      type: "Error",
      code: 403,
      message: "Invalid API key. Access to content denied."
    });
  }
  const { link } = request.body;


  console.log("link",link);
  

  if (!link) {
    response.status(400).send({
      type: "Error",
      code: 400,
      message: "Expected {link: string}",
    });
    return;
  }
  try {
    // const database = await connectToDatabase();
    const database = await prisma.shortUrl
  
    const hash = getHash();
    const linkExists = await database.findUnique({
      where: {
        link
      }
    });
    const shortUrl = `${process.env.HOST}/${hash}`;
    console.log(linkExists);
    if (!linkExists) {
      await database.create({
       data:{
        link: link,
        uid: hash,
        shortUrl: shortUrl,
       }
      });
    }
    response.status(201);
    response.send({
      type: "success",
      code: 201,
      data: {
        shortUrl: linkExists?.shortUrl || shortUrl,
        link,
      },
    });
    await prisma.$disconnect()
  } catch (e: any) {
    console.log(e);
    response.status(500);
    response.send({
      code: 500,
      type: "error",
      message: e.message,
    });
  }
}
