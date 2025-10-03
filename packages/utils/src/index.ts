import {z} from "zod";

export const CreateUserSchema = z.object({
    username : z.string().min(3).max(10),
    password : z.string().min(8),
    email : z.string()
})

export const SignInSchema = z.object({
    username : z.string().min(3).max(10),
    password : z.string().min(8)
})

export const CreateRoomSchema = z.object({
    slug : z.string().min(3).max(20)
})