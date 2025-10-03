import WebSocket , { WebSocketServer } from 'ws';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import prisma from '@repo/db/client'
dotenv.config();

const wss = new WebSocketServer({ port: 8080 });

interface User{
    ws : WebSocket,
    rooms : string[],
    userId : string
}

const users : User[] = [];

wss.on('connection', function connection(ws , request) {
    const url = request.url;
    if(!url){
        return;
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') ?? "";
    let userId = "";
    try {
        const decoded = jwt.verify(token , process.env.JWT_SECRET as string) as JwtPayload;
        if(!decoded || !decoded.userId){
            ws.close()
            return;
        }
        userId = decoded.userId;
    } catch (error) {
        console.log("Invalid credentials");
        ws.close()
        return;
    }

    users.push({
        userId,
        rooms : [],
        ws
    })

    ws.on('error', console.error);

    ws.on('message', async function message(data) {
        const parsedData = JSON.parse(data as unknown as string)
        if(parsedData.type === "join_room"){
            const roomId = parsedData.roomId;
            const user = users.find(x => x.ws === ws);
            user?.rooms.push(roomId);
        }

        if(parsedData.type === "leave_room"){
            const roomId = parsedData.roomId;
            const user = users.find(x => x.ws === ws);
            if(!user){
                return;
            }
            user.rooms = user?.rooms.filter(x => x === roomId);
        }

        if(parsedData.type === "chat"){
            const roomId = parsedData.roomId;
            const message = parsedData.message;

            await prisma.chat.create({
                data : {
                    roomId : Number(roomId) ,
                    message,
                    userId
                }
            })
            
            users.forEach((user) => {
                if(user.rooms.includes(roomId)){
                    console.log(user.userId)
                    user.ws.send(JSON.stringify({
                        type : "chat",
                        message : message,
                        sender : userId
                    }))
                }
            })
        }
    });

});