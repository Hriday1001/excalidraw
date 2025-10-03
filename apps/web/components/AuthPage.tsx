"use client";

import axios from "axios";
import { FRONTEND_URL, HTTP_BACKEND_URL } from "../config";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function AuthPage({isSignin}: {
    isSignin: boolean
}) {

    const [username , setUsername] = useState("");
    const [email , setEmail] = useState("");
    const [password , setPassword] = useState("");
    const router = useRouter();

    const handleAuth = async () => {
        try {
            if(isSignin){
                const res = await axios.post(`${HTTP_BACKEND_URL}/signin` , {
                    username : username,
                    password : password
                })
    
                const token = res.data.token;
                localStorage.setItem("token" , token);
            }
            else{
                const res = await axios.post(`${HTTP_BACKEND_URL}/signup` , {
                    email : email,
                    username : username,
                    password : password
                })
                if(res.status === 200){
                    router.push(`${FRONTEND_URL}/auth/signin`);
                }
            }
        } catch (error) {
            console.log("Error" , error);
        }
    }

    return <div className="w-screen h-screen flex justify-center items-center">
        <div className="p-6 m-2 bg-white rounded">
            {!isSignin && (
                    <div className="p-2">
                        <input
                            type="text"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border p-2 rounded w-full"
                        />
                    </div>
            )}
            <div className="p-2">
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="border p-2 rounded w-full"
                />
            </div>
            <div className="p-2">
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border p-2 rounded w-full"
                />
            </div>

            <div className="pt-2">
                <button className="bg-red-200 rounded p-2" onClick={handleAuth}>{isSignin ? "Sign in" : "Sign up"}</button>
            </div>
        </div>
    </div>

}