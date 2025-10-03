import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { authMiddleware } from "./middleware";
import {CreateRoomSchema, CreateUserSchema, SignInSchema} from "@repo/utils/config";
import prisma from "@repo/db/client";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.post('/signup' , async (req,res)=>{
    const parsedData = CreateUserSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(403).json({
            message : "Incorrect input types"
        })
        return;
    }

    const password = parsedData.data.password
    const hashedPassword = await bcrypt.hash(password , 10)

    try {
        const user = await prisma.user.create({
            data : {
                email : parsedData.data.email,
                username : parsedData.data.username,
                password : hashedPassword
            }
        })
        res.status(200).json({
            userId : user.id,
            message : "User created successfully"
        })
    } catch (error) {
        res.status(403).json({
            message : "User already exists"
        })
    }
})

app.post('/signin' , async (req,res)=>{

    const parsedData = SignInSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(403).json({
            message : "Incorrect input types"
        })
        return;
    }

    const username = parsedData.data.username;
    const password = parsedData.data.password;
    const existingUser = await prisma.user.findFirst({
        where : {
            username : username
        }
    })
    if(existingUser){
        const passwordMatch = await bcrypt.compare(password , existingUser.password)

        if(!passwordMatch){
            res.status(403).json({
                message : "Incorrect Password"
            })
            return;
        }
        
        const token = jwt.sign({
            userId : existingUser.id
        } , process.env.JWT_SECRET as string)
    
        res.status(200).json({
            token : token,
            message : "User Signedin"
        })

    }
    else{
        res.status(403).json({
            message : "User not found"
        })
        return;
    }

    
})

app.post('/room' , authMiddleware , async (req : CustomRequest,res)=>{
    const parsedData = CreateRoomSchema.safeParse(req.body)
    if(!parsedData.success){
        res.status(403).json({
            message : "Incorrect request"
        })
        return;
    }

    const userId = req.userId as string

    try {
        const room = await prisma.room.create({
            data : {
                adminId : userId,
                slug : parsedData.data.slug
            }
        })
    
        res.status(200).json({
            roomId : room.id,
            message : "Room created successfully"
        })
    } catch (error) {
        res.status(403).json({
            message : "Error while creating room"
        })
    }
})

app.get('/chats/:roomId' , async (req,res) => {
    const roomId = Number(req.params.roomId);
    try {
        const chats = await prisma.chat.findMany({
            where : {
                roomId : roomId
            },
            orderBy : {
                id : "desc"
            },
            take : 50
        });

        res.status(200).json({
            message : "Chats retrieved",
            chats
        })

    } catch (error) {
        res.status(504).json({
            message : "Error while retrieving chats"
        })
    }

})

app.get('/room/:slug' , async (req, res) => {
    const slug = req.params.slug;
    try {
        const room = await prisma.room.findFirst({
            where : {
                slug : slug
            }
        })
        res.status(200).json({
            room
        })
    } catch (error) {
        res.status(503).json({
            message : "Error while retrieving room"
        })
    }

    
})

app.listen(3001);