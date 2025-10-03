"use client";

import { useEffect, useRef } from "react"
import { Draw } from "../draw";

export default function DrawingCanvas({roomId , socket} : {roomId : string , socket : WebSocket}){
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(()=>{
        if(canvasRef.current){
            Draw(canvasRef.current , roomId , socket);
        }
    } , [canvasRef])

    return (
        <>
        <div>
        <canvas ref={canvasRef} width={2000} height={2000}></canvas>
        </div>
        </>
    )
}