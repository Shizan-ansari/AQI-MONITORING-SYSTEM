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

    const [popupMessage, setPopupMessage] = useState("");
    const [popupType, setPopupType] = useState(""); // success | error
    const [showPopup, setShowPopup] = useState(false);

    const {handleRegister,handleLoginSuccess, handleLogin} = useContext(AuthContext);
    const router = useRouter();

    const showPopupMessage = (msg,type)=>{
        setPopupMessage(msg);
        setPopupType(type);
        setShowPopup(true);

        setTimeout(()=>{
            setShowPopup(false);
            setPopupMessage("");
        },3000);
    }

    const resetFields = ()=>{
        setUsername("");
        setEmail("");
        setPassword("");
    }

    const validateEmail = (email)=>{
        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        return gmailRegex.test(email);
    }

    const handleUserRegister = async ()=>{
        try {

            if(!username || !email || !password){
                showPopupMessage("All fields are required","error");
                return;
            }

            if(!validateEmail(email)){
                showPopupMessage("Email must end with @gmail.com","error");
                return;
            }

            await handleRegister(username,email,password);

            resetFields();

            showPopupMessage("User Registered Successfully","success");

        } catch (error) {
            showPopupMessage(error.response?.data?.message || "Something went wrong","error");
        }
    }

    const handleUserLogin = async ()=>{
        try {

            if(!email || !password){
                showPopupMessage("All fields are required","error");
                return;
            }

            if(!validateEmail(email)){
                showPopupMessage("Email must end with @gmail.com","error");
                return;
            }

            let result = await handleLogin(email,password);

            resetFields();

            showPopupMessage("User Logged In Successfully","success");

            handleLoginSuccess(result.data.token);

        } catch (error) {
            showPopupMessage(error.response?.data?.message || "Invalid Login","error");
        }
    }

    useEffect(()=>{
        if(localStorage.getItem("token")){
            router.push("/dashboard");
        }
    },[])

  return (
    <>
    <NavbarComponent/>

    {/* Popup */}
    {showPopup && (
        <div className={`${styles.popup} ${popupType === "success" ? styles.success : styles.error}`}>
            {popupMessage}
        </div>
    )}

        <div>
           <div className={styles.container}>
            <div className={styles.cardContainer}>

                <div className={styles.cardContainer_left}>
                    <p className={styles.cardLeftHeading}>
                        {userLoginMethod ? "Login" : "SignUP"}
                    </p>

                    <div className={styles.inputContainer}>

                        {!userLoginMethod && 
                            <input
                                value={username}
                                onChange={(e)=>setUsername(e.target.value)}
                                className={styles.inputField}
                                type="text"
                                placeholder='Username'
                            />
                        }

                        <input
                            value={email}
                            onChange={(e)=>setEmail(e.target.value)}
                            className={styles.inputField}
                            type="text"
                            placeholder='Email'
                        />

                        <input
                            value={password}
                            onChange={(e)=>setPassword(e.target.value)}
                            className={styles.inputField}
                            type="password"
                            placeholder='Password'
                        />

                    </div>

                    <div
                        onClick={userLoginMethod ? handleUserLogin : handleUserRegister}
                        className={styles.buttonWithOutline}
                    >
                        <p>{userLoginMethod ? "Login" : "SignUp"}</p>
                    </div>

                </div>

                <div className={styles.cardContainer_right}>
                   {userLoginMethod ? <p>Don't Have An Account?</p> : <p>Already Have An Account?</p>}

                   <div
                    onClick={()=>{
                        setUserLoginMethod(!userLoginMethod)
                        resetFields()
                    }}
                    style={{color: "black", textAlign : "center", background: "rgba(235, 232, 232, 1)"}}
                    className={styles.buttonWithOutline}
                   >
                   <p>{userLoginMethod ? "SignUp": "Login"}</p>
                </div>
                </div>

            </div>
           </div>
        </div>
    </>
  )
}