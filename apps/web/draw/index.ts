import axios from "axios";
import { HTTP_BACKEND_URL } from "../config";

type Shape = {
    type : "rectangle";
    x : number;
    y : number;
    width : number;
    height : number;
} | {
    type : "circle";
    x : number;
    y : number;
    radius : number;
}

export async function Draw(canvas : HTMLCanvasElement , roomId : string , socket : WebSocket){
    const ctx = canvas.getContext("2d");
    if(!ctx){
        return;
    }
    ctx.fillStyle = "rgba(0,0,0)";
    ctx.fillRect(0,0,canvas.width , canvas.height);

    socket.onmessage = (e) => {
        const message = JSON.parse(e.data);
        if(message.type === "chat"){
            const parsedShape = JSON.parse(message.message);
            existingShapes.push(parsedShape);
            ResetCanvas(canvas,ctx,existingShapes);
        }
    }

    let clicked = false;
    let startX = 0;
    let startY = 0;
    let existingShapes : Shape[] = await getExistingShapes(roomId);
    ResetCanvas(canvas , ctx , existingShapes);

    canvas.addEventListener("mousedown" , (e) => {
        clicked = true;
        startX = e.clientX;
        startY = e.clientY;
    })

    canvas.addEventListener("mousemove" , (e) => {

        if(clicked){
            const width = e.clientX - startX;
            const height = e.clientY - startY;
            ResetCanvas(canvas,ctx,existingShapes);
            ctx.strokeStyle = "rgba(255,255,255)";
            ctx.strokeRect(startX,startY,width,height);
        }
    })

    canvas.addEventListener("mouseup" , (e) => {
        clicked = false;
        const width = e.clientX - startX;
        const height = e.clientY - startY;

        const shape = {
            type : "rectangle",
            x : startX,
            y : startY,
            width : width,
            height : height
        }

        existingShapes.push(shape as Shape);

        socket.send(JSON.stringify({
            type : "chat",
            message : JSON.stringify(shape),
            roomId : roomId
        }))
    })
}

function ResetCanvas(canvas : HTMLCanvasElement , ctx : CanvasRenderingContext2D, existingShapes : Shape[]){
    
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "rgba(0,0,0)";
    ctx.fillRect(0,0,canvas.width,canvas.height);   
    
    existingShapes.map((shape) => {
        if(shape.type === "rectangle"){
            ctx.strokeStyle = "rgba(255,255,255)";
            ctx.strokeRect(shape.x,shape.y,shape.width,shape.height);
        }
    })
}

async function getExistingShapes(roomId : string){
    const res = await axios.get(`${HTTP_BACKEND_URL}/chats/${roomId}`);
    const chats = res.data.chats;

    const shapes = chats.map((x : {message : string}) => {
        const chatData = JSON.parse(x.message);
        return chatData
    })

    return shapes;
}