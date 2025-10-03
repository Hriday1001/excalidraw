"use client";

import { useEffect, useState } from "react"
import { WS_BACKEND_URL } from "../config";
import DrawingCanvas from "./DrawingCanvas";

export default function RoomCanvas({roomId} : {roomId : string}){
    const [socket , setSocket] = useState<WebSocket | null>(null);

    useEffect(()=>{
        if (socket) return;
        const savedToken = localStorage.getItem("token");
        if (!savedToken) return; 

        const ws = new WebSocket(`${WS_BACKEND_URL}?token=${savedToken}`);
        ws.onopen = () => {
            setSocket(ws);
            ws.send(JSON.stringify({
                type : "join_room",
                roomId
            }))
        }

        return () => {
            ws.close();
        };
    } , [])

    if(!socket){
        return <div>
            Connecting to server ...
        </div>
    }

    return (
        <>
        <div>
        <DrawingCanvas roomId={roomId} socket={socket}/>
        </div>
        </>
    )
}