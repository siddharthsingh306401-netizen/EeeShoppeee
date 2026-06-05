'use client';
import React, { useState } from 'react'
import {useform} from "react-hook-form";
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';    

type FormData = {
    email:string;
    password:string;
};

const Login =() =>{
    const[passwordVisible, setPasswordVisible] = useState(false);
    const[serverError,setServerError]= useState<string| null>(null);
    const[rememberMe,setRemember]= useState(false);
    const router = useRouter();

    const{
        register,
        handelSubmit,
        formState:{errors},
    } = useForm<FormData>()
    const loginMutation = useMutation({
        mutationFn: async(data:FormData)=>{
            const response= await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/login-user`,
                data,
                {withCredentials:true}
            );
            return response.data;
        
        },

        onSuccess:(data)=>{
            setServerError(null);
            router.push("/");
        },
        onError: (error:AxiosError) => {
            const errorMessage= 
            (error.response?.data as {message?:string})?.message ||

        "Invalid credentials!";
            setServerError(errorMessage);
        }, 
    });
    const onSubmit = (data: FormData) => {
        loginMutation.mutate(data);
    };
    return (
    <div className='w-full py-10 min-h-[85vh] bg-[#f1f1f1]'>
        <h1 className='text-4xl font-Poppins font-semibold text-black text-center'>
            Login
        </h1>
        <p className='text-center text-lg font-medium py-3 text-[#00000099]'>
            home.Login
        </p>
        <div className='w-full flex justify-center'>
        <div className='md:w-[480px] p-8 bg-white shadow rounded-lg'>
        <h3 className='text-3xl font-semibold text-center mb-2'>
            Login to Eshop

        </h3>
        <p className='text-center text-gray-500 mb-4'>
              Dont have account?{" "}
        <Link href={"/signup"} className='text-blue-500 hover:underline'>
            Sign up
        </Link>
        </p>
        <button type="button" className='w-full flex items-center justify-center gap-2 border border-gray-300 rounded py-2 text-sm font-medium text-gray-700'>
            <GoogleIcon width={20} height={20} className="h-5 w-5" />
            Sign in with Google
        </button>
        <div className='flex items-center my-5 text-gray-400 text-sm'>
        <div className='flex-1 border-t border-gray-300'/>
        <span className='px-3'>
            or Sign in with email
        </span>
        <div className='flex-1 border-t border-gray-300'/>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
        <label className='block mb-1 font-medium text-gray-700'>
            Email
        </label>
        <input type ="email"
         placeholder='@gmail.com'
         className='w-full p-2 border border-gray-300 outline-0 rounded mb-1'
         {...register("email",{
            required:"Email is required",
            pattern:{
                value:/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
                message:"Invalid email address"
            }
        })}
        />
        {errors.email && (
            <p className='text-red-500 text-sm mt-1'>
            {String(errors.email.message)}
            </p>
        )}
        <label className='block mb-1 font-medium text-gray-700'>Password</label>
        <div className="relative">
            <input
            type={passwordVisible ? "text" : "password"}
            placeholder="Min. 6 characters"
            className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
            {...register("password",{
                required:"Password is required",
                minLength:{
                    value:6,
                    message:"Password must be at least 6 characters"
                }
            })}
            />


            <button type="button" onClick={()=> setPasswordVisible(!passwordVisible)}
                aria-label={passwordVisible ? "Hide password" : "Show password"}
                className='absolute inset-y-0 right-3 flex items-center text-gray-400'>
                    {passwordVisible ? <Eye /> : <EyeOff />}

            </button>
            {errors.password &&(
            <p className='text-red-500 text-sm mt-1'> 
            {String(errors.password.message)}
            </p>
            )}
           
        </div>
         <div className='flex justify-between items-center my-4'>
                <label className='flex items-center text-gray-600'>
                    <input type="checkbox" className='mr-2' checked={rememberMe} onChange={(e)=> setRememberMe(e.target.checked)}/>
                    remember me
                </label>
                <Link href={'/forgot-password'} className='text-blue-500  text-sm'>
                Forgot Password?
                </Link>
            </div>
            <button type = "submit"
            disabled={loginMutation.isLoading}
            className='w-full text-lg cursor-pointer bg-black text-white py-2 rounded-lg'>
                {loginMutation.isPending ? "Logging in..." : "Login"}
            </button>
            {serverError && (
                <p className='text-red-500 text-sm mt-2 '> 
                {serverError}
                </p>
                )}
        </form>
        </div>
        </div>
        </div>
  );
}

export default Login;
