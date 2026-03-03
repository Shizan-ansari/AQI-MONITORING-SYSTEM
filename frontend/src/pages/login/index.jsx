import NavbarComponent from '@/components/navbar'
import React, { useContext, useEffect, useState } from 'react'
import styles from "./index.module.css";
import { AuthContext } from '@/context/authContext';
import { useRouter } from 'next/router';

export default function LoginPage() {
    const [userLoginMethod, setUserLoginMethod] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const[error, setError] = useState("");

    const {handleRegister,handleLoginSuccess, handleLogin} = useContext(AuthContext);
    const router = useRouter();

    let handleUserRegister = async () =>{
        try {
            let result = await handleRegister(username,email,password);
            console.log(result);
            setEmail("");
            setUsername("");
            setPassword("");
        } catch (error) {
            setError(error.response?.data?.message || "Something went wrong");
        }
    }
    let handleUserLogin = async() =>{
        try {
            let result = await handleLogin(email,password);
            console.log(result);
            setEmail("");
            setPassword("");

            handleLoginSuccess(res.data.token);
        } catch (error) {
           setError(error.response?.data?.message || "Something went wrong"); 
        }
    }
    useEffect(() =>{
        if(localStorage.getItem("token")){
            router.push("/dashboard");
        }
    },[])
    
  return (
    <>
    <NavbarComponent/>
        <div>
           <div className={styles.container}>
            <div className={styles.cardContainer}>
                <div className={styles.cardContainer_left}>
                    <p className={styles.cardLeftHeading}>{userLoginMethod ? "Login" : "SignUP"}</p>
                    <div className={styles.inputContainer}>
                        {!userLoginMethod && 
                            <input value={username} onChange={(e) => setUsername(e.target.value)} className={styles.inputField} type="text" placeholder='Username' />
                            }
                        <input value={password} onChange={(e) => setPassword(e.target.value)} className={styles.inputField} type="text" placeholder='Password' />
                        <input value={email} onChange={(e) => setEmail(e.target.value)} className={styles.inputField} type="text" placeholder='Email' />

                        {error && <p style={{ color: "red" }}>{error}</p>}
                    </div>
                    <div onClick={userLoginMethod ? handleUserLogin : handleUserRegister} className={styles.buttonWithOutline}>
                        <p>{userLoginMethod ? "Login" : "SignUp"}</p>
                    </div>
                </div>
                <div className={styles.cardContainer_right}>
                   {userLoginMethod ? <p>Don't Have An Account?</p> : <p>Already Have An Account?</p>}
                   <div onClick={()=>{
                    setUserLoginMethod(!userLoginMethod)
                   }} style={{color: "black", textAlign : "center", background: "rgba(235, 232, 232, 1)"}} className={styles.buttonWithOutline}> 
                   <p>{userLoginMethod ? "SignUp": "Login"}</p>
                </div>
                </div>
            </div>
           </div>
        </div>
   
    </>
    
  )
}
