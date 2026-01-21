import { useEffect, useRef, useState } from "react";
import { Button } from "../components/button";
import { Input } from "../components/Input";
import { BrainIcon } from "../icons/brainIcon";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";

export function SignIn(){
    const usernameRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState< string | null> (null);
    const [passwordError, setPasswordError] = useState(false);

    useEffect(() => {
        if (passwordError) {
        const timer = setTimeout(() => {
          setPasswordError(false);
        }, 400); 

        return () => clearTimeout(timer);
      }
    }, [passwordError]);

    
   async function signin() {
    try {
        setLoading(true);
        const username = usernameRef.current?.value;
        const password = passwordRef.current?.value;

        await axios.post(`${BACKEND_URL}/api/v1/signin`, {
          username,
          password,
        },
        { withCredentials: true }
    );

        navigate("/dashboard");

        } catch (err: unknown) {
            setPasswordError(false); 
            setTimeout(() => {
              setPasswordError(true); 
            }, 10);
          if(axios.isAxiosError(err)){
            const status = err.response?.status;
            if(status === 401){
                setError("Invalid Username or Password");
            }else if(status === 500){
                setError("Username and password are required");
            }else{
                setError("something went wrong please try again");
            }
          }else{
            setError("Network error");
          }
        } finally {
          setLoading(false);
        }
    }
    return(
        <div className="h-screen w-screen bg-linear-to-br from-purple-100 via-white to-indigo-100 flex justify-center items-center">
            <div className="bg-white rounded-2xl border border-gray-200 min-w-90 p-8 shadow-xl transition-transform duration-300 hover:-translate-y-1">
                <div className="flex justify-center items-center mb-6">
                    <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                        <BrainIcon />
                    </div>
                </div>

                <h2 className="text-2xl font-semibold text-center mb-1">
                    Welcome back
                </h2>
                <p className="text-sm text-gray-500 text-center mb-6">
                    Login to your Second Brain
                </p>

                <div className="flex flex-col justify-center items-center gap-2">
                    <Input reference={usernameRef} placeholder="Username" />
                    <Input reference={passwordRef} placeholder="Password" type="password" error={passwordError}/>
                </div>

                {error && (
                    <p className="text-red-500 text-sm text-center mt-3">
                        {error}
                    </p>
                )}

                <div className="flex justify-center pt-6">
                    <Button
                        onClick={signin}
                        varient="primary"
                        size="md"
                        text="Login"
                        fullWidth={true}
                        loading={loading}
                    />
                </div>

                <div className="flex justify-center items-center pt-5 text-sm">
                    <span className="text-gray-600">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-purple-600 font-medium hover:underline">
                            Signup
                        </Link>
                    </span>
                </div>
            </div>
        </div>
    )
}
