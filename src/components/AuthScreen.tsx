import React, { useState, useEffect } from 'react';
import { User, ClipboardList, Shield, GraduationCap, Phone, Check, LogIn, Lock, Sparkles, Building, ArrowRight, AlertCircle, RefreshCw, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FallbackImage } from './FallbackImage';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth } from '../firebase/config';
import firebaseConfig from '../../firebase-applet-config.json';
import { signInWithGoogle } from '../supabaseClient';
import { SafeStorage } from '../lib/storage';

interface AuthScreenProps {
  onSuccess: (user: { id: string; name: string; email: string; role: 'customer' | 'admin'; studentProfile?: any }) => void;
}

export function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'verification' | 'profile_setup'>('login');
  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  // Auth Fields & Methods
  const [authMethod, setAuthMethod] = useState<'firebase' | 'otp'>('firebase');
  const [firebaseEmail, setFirebaseEmail] = useState('');
  const [firebasePassword, setFirebasePassword] = useState('');
  
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  
  // Detection for Firebase sandbox/mock mode
  const isFirebaseMock = !firebaseConfig || firebaseConfig.projectId === 'mock-app';
  
  // Registration Fields
  const [emailAddress, setEmailAddress] = useState('');
  
  // Profile Setup Fields
  const [fullName, setFullName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [branch, setBranch] = useState('Computer Science (CSE)');
  const [year, setYear] = useState<'1st Year' | '2nd Year' | '3rd Year' | '4th Year'>('1st Year');
  const [contactNo, setContactNo] = useState('');
  
  // App Setup States
  const [tempUserId, setTempUserId] = useState<string | null>(null);
  const [tempUserEmail, setTempUserEmail] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [receivedOtp, setReceivedOtp] = useState<string | null>(null);
  const [isRegisterVerification, setIsRegisterVerification] = useState(false);
  const [showSmsSimulator, setShowSmsSimulator] = useState(false);
  const [simulatorMessage, setSimulatorMessage] = useState('');
  const [showEmailSimulator, setShowEmailSimulator] = useState(false);
  const [simulatorEmailMessage, setSimulatorEmailMessage] = useState('');
  const [isGoogleLogin, setIsGoogleLogin] = useState(false);

  // Handle Google OAuth Pop-up launch utilizing Supabase Client & Backend Fallbacks
  const handleGoogleLogin = () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      SafeStorage.setItem('google_auth_popup_active', 'true');
      const bootstrapUrl = `${window.location.origin}/?google_auth_init=true`;

      const width = 500;
      const height = 600;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;

      const authWindow = window.open(
        bootstrapUrl,
        'google_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
      );

      if (!authWindow) {
        throw new Error("Popup blocked! Please allow popups for this site to log in with Google.");
      }
    } catch (err: any) {
      setError(err.message || "An exception occurred launching Google Authentication.");
      setLoading(false);
    }
  };

  // Google OAuth callback state listener
  useEffect(() => {
    const handleLoginSuccess = async (authedUser: any, hasProfile: boolean, profile: any) => {
      if (authedUser) {
        if (authedUser.email && authedUser.email.toLowerCase() === 'shivaganeshmummadi7@gmail.com' || authedUser.email.toLowerCase() === 'amareshkaturi@gmail.com' || authedUser.email.toLowerCase() === 'akshith5481@gmail.com' || authedUser.email.toLowerCase() === 'coresoft.srinivas@gmail.com') {
          authedUser.role = 'admin';
        }

        let finalProfile = profile;
        let finalHasProfile = hasProfile || !!profile;

        // Query the profile status from server to avoid client-side false negatives
        try {
          const res = await fetch(`/api/student/profile/${authedUser.id}?email=${encodeURIComponent(authedUser.email || '')}`, { credentials: 'include' });
          if (res.ok) {
            const serverProfile = await res.json();
            if (serverProfile && serverProfile.id) {
              finalProfile = serverProfile;
              finalHasProfile = true;
            }
          }
        } catch (e) {
          console.error("Failed to query profile status from server", e);
        }

        if (finalHasProfile) {
          setSuccessMsg("Google Login successful! Accessing CampusBites...");
          setTimeout(() => {
            onSuccess({ ...authedUser, studentProfile: finalProfile });
          }, 1200);
        } else {
          setTempUserId(authedUser.id);
          setTempUserEmail(authedUser.email || '');
          setFullName(authedUser.name || '');
          setSuccessMsg("Google Auth authenticated. Please configure student profile details.");
          setTimeout(() => {
            setMode('profile_setup');
          }, 1200);
        }
      }
    };

    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (origin !== window.location.origin) {
        return;
      }

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { user: authedUser, hasProfile, profile } = event.data;
        handleLoginSuccess(authedUser, hasProfile, profile);
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onSuccess]);

  const branches = [
    'Computer Science (CSE)',
    'Electronics & Comm (ECE)',
    'Electrical Eng (EEE)',
    'Mechanical Eng (ME)',
    'Civil Engineering (CE)',
    'Artificial Intelligence & DS',
    'Biotechnology',
    'Business Administration (BBA)'
  ];

  const handleFirebaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseEmail.trim() || !firebasePassword) {
      setError("Please supply both email and password.");
      return;
    }
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    if (isFirebaseMock) {
      setSuccessMsg("Simulation Mode: Firebase Account Authenticated! Querying active student profile...");
      setTimeout(async () => {
        try {
          const mockUid = "fb-usr-" + Math.abs(firebaseEmail.split('@')[0].split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
          
          const response = await fetch(`/api/student/profile/${mockUid}?email=${encodeURIComponent(firebaseEmail.trim())}`, { credentials: 'include' });
          const profile = response.ok ? await response.json() : null;
          
          if (profile && profile.fullName) {
            const u = {
              id: mockUid,
              name: profile.fullName,
              email: firebaseEmail.trim(),
              role: 'customer' as const
            };
            setSuccessMsg("Firebase login accomplished! Loading CampusBites...");
            setTimeout(() => {
              onSuccess({ ...u, studentProfile: profile });
            }, 1000);
          } else {
            setTempUserId(mockUid);
            setTempUserEmail(firebaseEmail.trim());
            setFullName(firebaseEmail.split('@')[0]);
            setSuccessMsg("Authenticated! Redirecting to setup student academic profile details...");
            setTimeout(() => {
              setMode('profile_setup');
              setLoading(false);
            }, 1200);
          }
        } catch (err: any) {
          setError(err.message || "Login exception.");
          setLoading(false);
        }
      }, 1500);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, firebaseEmail.trim(), firebasePassword);
      const user = userCredential.user;
      
      const response = await fetch(`/api/student/profile/${user.uid}?email=${encodeURIComponent(user.email || firebaseEmail.trim())}`, { credentials: 'include' });
      const profile = response.ok ? await response.json() : null;

      if (profile && profile.fullName) {
        const u = {
          id: user.uid,
          name: profile.fullName,
          email: user.email || firebaseEmail.trim(),
          role: 'customer' as const
        };
        setSuccessMsg("Firebase login successful! Accessing CampusBites...");
        setTimeout(() => {
          onSuccess({ ...u, studentProfile: profile });
        }, 1000);
      } else {
        setTempUserId(user.uid);
        setTempUserEmail(user.email || firebaseEmail.trim());
        setFullName(user.displayName || user.email?.split('@')[0] || "");
        setSuccessMsg("Authenticated with Firebase! Redirecting to setup profile details...");
        setTimeout(() => {
          setMode('profile_setup');
          setLoading(false);
        }, 1200);
      }
    } catch (err: any) {
      let friendlyMsg = err.message || "An exception occurred signing in.";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        friendlyMsg = "Incorrect email address or password. Please verify your credentials and try again.";
      }
      setError(friendlyMsg);
      setLoading(false);
    }
  };

  const handleFirebaseRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !emailAddress.trim() || !firebasePassword || !mobileNumber.trim()) {
      setError("All fields are mandatory to secure registration.");
      return;
    }
    if (mobileNumber.trim().length !== 10) {
      setError("Please enter a valid 10-digit mobile contact number.");
      return;
    }
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    if (isFirebaseMock) {
      setSuccessMsg("Simulation Mode: Firebase Account registered successfully! Processing student profile registration...");
      setTimeout(() => {
        const mockUid = "fb-usr-" + Math.abs(emailAddress.split('@')[0].split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
        setTempUserId(mockUid);
        setTempUserEmail(emailAddress.trim());
        setFullName(fullName.trim());
        setContactNo(mobileNumber.trim());
        setSuccessMsg("Firebase setup initiated! Please fill your educational specifics on the next screen.");
        setTimeout(() => {
          setMode('profile_setup');
          setLoading(false);
        }, 1200);
      }, 1500);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, emailAddress.trim(), firebasePassword);
      const user = userCredential.user;
      
      setTempUserId(user.uid);
      setTempUserEmail(user.email || emailAddress.trim());
      setFullName(fullName.trim());
      setContactNo(mobileNumber.trim());
      
      setSuccessMsg("Firebase account created! Transitioning to academic profile details...");
      setTimeout(() => {
        setMode('profile_setup');
        setLoading(false);
      }, 1200);
    } catch (err: any) {
      let friendlyMsg = err.message || "An exception occurred registering user.";
      if (err.code === 'auth/email-already-in-use') {
        friendlyMsg = "This email is already in use by another student account.";
      } else if (err.code === 'auth/weak-password') {
        friendlyMsg = "Weak password. Please use a password with at least 6 characters.";
      } else if (err.code === 'auth/invalid-email') {
        friendlyMsg = "The email address is improperly structured.";
      }
      setError(friendlyMsg);
      setLoading(false);
    }
  };

  // Request code dispatch to mobile
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.trim().length !== 10) {
      setError("Please put in a valid 10-digit mobile contact number.");
      return;
    }
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    setIsRegisterVerification(false);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber: mobileNumber.trim() }),
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to dispatch verification code.");
      }
      
      setReceivedOtp(data.otp);
      setMode('verification');
      
      if (data.smsSent) {
        setSuccessMsg(`OTP sent successfully to +91 ${mobileNumber.trim()} via ${data.smsGatewayUsed}!`);
      } else {
        if (data.error) {
          setError(`Fast2SMS Gateway Error: ${data.error}. Falling back to local Sandbox Simulation.`);
        } else {
          setSuccessMsg(`OTP code generated! (Sandbox Test Code: ${data.otp})`);
        }
        
        // Trigger Swiggy-like top floating SMS simulation
        setSimulatorMessage(`[CampusBites] Your OTP code is ${data.otp}. Valid for 5 mins. Please do not share this code with anyone.`);
        setShowSmsSimulator(true);
        // Clean up simulator after 10s
        setTimeout(() => {
          setShowSmsSimulator(false);
        }, 12000);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while dispatching OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Submit first-time sign-up and dispatch Email Verification code
  const handleRegisterSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !emailAddress.trim() || !mobileNumber.trim()) {
      setError("Please fill in all details to get started.");
      return;
    }
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      // Auto-generate a valid unique roll number behind the scenes
      const yearPrefix = new Date().getFullYear().toString().slice(-2);
      const random4 = Math.floor(1000 + Math.random() * 9000).toString();
      const generatedRoll = `${yearPrefix}N81A${random4}`;
      setRollNo(generatedRoll);

      const response = await fetch('/api/auth/register-send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          rollNo: generatedRoll,
          branch: "Computer Science (CSE)",
          year: "1st Year",
          email: emailAddress.trim(),
          mobileNumber: mobileNumber.trim()
        }),
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit registration details.");
      }

      setReceivedOtp(data.otp);
      setIsRegisterVerification(true);
      setMode('verification');

      if (data.emailSentCloud) {
        setSuccessMsg(`OTP code dispatched successfully to ${emailAddress.trim()} via Supabase! Please check your email inbox.`);
      } else {
        setSuccessMsg(`Registration pending verification! OTP code generated: ${data.otp}`);
        
        // Trigger high-fidelity Mail client Inbox push simulator
        setSimulatorEmailMessage(`[CampusBites] Hello ${fullName.trim()}, your secure OTP verification code is: ${data.otp}. We have also attempted dispatching a real OTP via Supabase to ${emailAddress.trim()}.`);
        setShowEmailSimulator(true);
        setTimeout(() => {
          setShowEmailSimulator(false);
        }, 12000);
      }
    } catch (err: any) {
      setError(err.message || "An exception occurred filing sign-up details.");
    } finally {
      setLoading(false);
    }
  };

  // Perform transaction check on OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length === 0) {
      setError("Please provide the received verification code.");
      return;
    }
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    if (isRegisterVerification) {
      // First-time signup email verification pathway
      try {
        const response = await fetch('/api/auth/register-verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailAddress.trim(), otp: otp.trim() }),
          credentials: 'include'
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Verification rejected.");
        }

        const u = data.user;
        const finalProfile = data.profile;

        setSuccessMsg("Email OTP Verified! Registry saved & locked into CampusBites...");
        setTimeout(() => {
          onSuccess({
            ...u,
            studentProfile: finalProfile
          });
        }, 1200);
      } catch (err: any) {
        setError(err.message || "The verification code is incorrect. Try '123456'.");
      } finally {
        setLoading(false);
      }
    } else {
      // Normal mobile OTP entry login pathway
      try {
        const response = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobileNumber: mobileNumber.trim(), otp: otp.trim() }),
          credentials: 'include'
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Verification rejected.");
        }

        const u = data.user;
        const finalProfile = data.profile;

        if (data.hasProfile && finalProfile && finalProfile.rollNo) {
          // Background sync if profile didn't persist properly
          if (!data.hasProfile && finalProfile) {
            fetch('/api/student/profile/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: u.id, profile: finalProfile }),
              credentials: 'include'
            }).catch(syncErr => console.warn("Background sync failed:", syncErr));
          }

          setSuccessMsg("OTP Verified! Logging into CampusBites...");
          setTimeout(() => {
            onSuccess({
              ...u,
              studentProfile: finalProfile
            });
          }, 1200);
        } else {
          // Force Profile Setup first and auto pre-fill contactNo which has been verified!
          setTempUserId(u.id);
          setTempUserEmail(u.email);
          setContactNo(mobileNumber.trim());
          setSuccessMsg("OTP Verified! Connecting student registry...");
          setTimeout(() => {
            setMode('profile_setup');
            setSuccessMsg(null);
          }, 1200);
        }
      } catch (err: any) {
        setError(err.message || "The verification code is incorrect. Try '123456'.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Verify registration via clicking the email confirmation link (fallback when no numeric OTP is sent)
  const handleVerifyEmailLink = async () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register-verify-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailAddress.trim() }),
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Verification link check pending. Please ensure you clicked the link first.");
      }

      const u = data.user;
      const finalProfile = data.profile;

      setSuccessMsg("Email Link verification succeeded! Registry saved & locked into CampusBites...");
      setTimeout(() => {
        onSuccess({
          ...u,
          studentProfile: finalProfile
        });
      }, 1200);
    } catch (err: any) {
      setError(err.message || "We could not find your verification link click yet. Please click the confirmation link in the email first, then click check.");
    } finally {
      setLoading(false);
    }
  };

  // Submit complete student details
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalContactNo = contactNo.trim();
    const finalFullName = fullName.trim();

    if (!finalFullName) {
      setError("Please enter your full name.");
      return;
    }
    if (!finalContactNo || finalContactNo.length !== 10) {
      setError("Please enter a valid 10-digit mobile contact number.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      let uppercaseRoll = rollNo.trim().toUpperCase();
      let savedFullName = finalFullName;
      let savedBranch = branch || "Computer Science (CSE)";
      let savedYear = year || "1st Year";

      if (!uppercaseRoll) {
        // Generate a valid unique roll number format for Spoorthy
        const yearPrefix = new Date().getFullYear().toString().slice(-2);
        const random4 = Math.floor(1000 + Math.random() * 9000).toString();
        uppercaseRoll = `${yearPrefix}N81A${random4}`;
        setRollNo(uppercaseRoll);
      }

      let attempts = 0;
      let success = false;
      let lastErrMessage = "";
      let responseData: any = null;

      while (attempts < 5 && !success) {
        attempts++;

        const payload = {
          userId: tempUserId || "usr_" + uppercaseRoll.toLowerCase(),
          email: tempUserEmail || `${uppercaseRoll.toLowerCase()}@sphoorthy.edu.in`,
          collegeName: "Spoorthy Engineering College",
          rollNo: uppercaseRoll,
          fullName: savedFullName,
          branch: savedBranch,
          year: savedYear,
          contactNo: finalContactNo
        };

        const response = await fetch('/api/student/profile/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include'
        });
        responseData = await response.json();

        if (response.ok) {
          success = true;

          // Save to Firestore if Firebase isn't a mock
          if (!isFirebaseMock) {
            try {
              const { doc, setDoc } = await import('firebase/firestore');
              const { db } = await import('../firebase/config');
              const isAdminEmail = payload.email && payload.email.toLowerCase() === 'shivaganeshmummadi7@gmail.com' || payload.email.toLowerCase() === 'amareshkaturi@gmail.com' || payload.email.toLowerCase() === 'akshith5481@gmail.com' || payload.email.toLowerCase() === 'coresoft.srinivas@gmail.com';
              await setDoc(doc(db, 'users', payload.userId), {
                id: payload.userId,
                name: payload.fullName,
                email: payload.email,
                role: isAdminEmail ? 'admin' : 'customer',
                rollNo: payload.rollNo,
                contactNo: payload.contactNo,
                branch: payload.branch,
                year: payload.year,
                collegeName: payload.collegeName,
                createdAt: new Date().toISOString()
              });
            } catch (fireErr) {
              console.warn("Firestore database save skipped/failed:", fireErr);
            }
          }

          const finalUser = {
            id: payload.userId,
            name: payload.fullName,
            email: payload.email,
            role: (payload.email && payload.email.toLowerCase() === 'shivaganeshmummadi7@gmail.com' || payload.email.toLowerCase() === 'amareshkaturi@gmail.com' || payload.email.toLowerCase() === 'akshith5481@gmail.com' || payload.email.toLowerCase() === 'coresoft.srinivas@gmail.com') ? 'admin' as const : 'customer' as const
          };

          setSuccessMsg("Profile saved successfully! Loading CampusBites...");
          setTimeout(() => {
            onSuccess({
              ...finalUser,
              studentProfile: responseData.profile
            });
          }, 1500);
          break;
        } else {
          lastErrMessage = responseData.message || responseData.error || "Profile save failed.";
          // If the error indicates a duplicate roll number, generate a brand new one and retry
          if (lastErrMessage.toLowerCase().includes("duplicate") || lastErrMessage.toLowerCase().includes("conflict") || lastErrMessage.toLowerCase().includes("exist")) {
            const yearPrefix = new Date().getFullYear().toString().slice(-2);
            const random4 = Math.floor(1000 + Math.random() * 9000).toString();
            uppercaseRoll = `${yearPrefix}N81A${random4}`;
            setRollNo(uppercaseRoll);
            continue;
          } else {
            throw new Error(lastErrMessage);
          }
        }
      }

      if (!success) {
        throw new Error(lastErrMessage || "Unable to save profile, please try again.");
      }

    } catch (err: any) {
      setError(err.message || "An exception occurred saving your profile.");
      setLoading(false);
    }
  };

  return (
    <div id="auth-screen" className="flex items-center justify-center min-h-[calc(100vh-140px)] px-4 py-6">
      <motion.div 
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-6 sm:p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6"
      >
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-black text-[#1B4D3E] tracking-tight text-center">
            Campus<span className="text-[#4CAF50]">Bites</span>
          </h2>
          <p className="text-[10px] font-bold text-[#2E7D5A] mt-0.5 text-center uppercase tracking-widest">
            For Students,By Students
          </p>
          <p className="text-xs text-slate-500 mt-1 text-center font-sans">
            {mode === 'login' 
              ? "Connect instantly using your Google account to access your food court ordering."
              : "Complete your profile details below"}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-2xl animate-pulse flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="text-xs text-red-700 font-sans leading-relaxed">
              {error}
            </div>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-2.5">
            <Check className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5 animate-bounce" />
            <div className="text-xs text-emerald-800 font-sans leading-relaxed">
              {successMsg}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {mode === 'login' && (
            <motion.div 
              key="google-login-only"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <button
                type="button"
                id="google-signin-btn"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold py-3.5 px-4 rounded-xl active:scale-[0.98] transition-all cursor-pointer shadow-sm disabled:opacity-55"
              >
                {loading ? (
                   <div className="w-4 h-4 border-2 border-slate-300 border-t-[#1B4D3E] rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.113-5.136 4.113-3.41 0-6.173-2.763-6.173-6.173s2.763-6.173 6.173-6.173c1.554 0 2.97.575 4.062 1.517l2.943-2.943C18.99 2.193 15.822 1.1 12.24 1.1 6.223 1.1 1.34 5.983 1.34 12s4.883 10.9 10.9 10.9c6.641 0 11.041-4.664 11.041-11.223 0-.585-.054-1.023-.135-1.392H12.24z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </motion.div>
          )}

          {mode === 'profile_setup' && (
            <motion.form 
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleProfileSubmit} 
              className="space-y-4 text-left"
            >
              <div className="bg-[#1B4D3E]/10 p-3.5 border border-[#1B4D3E]/20 rounded-2xl mb-2">
                <h4 className="font-sans font-black text-[#1B4D3E] text-xs flex items-center gap-1.5">
                  <Sparkles className="w-4.5 h-4.5 text-[#1B4D3E] animate-pulse" />
                  {isGoogleLogin ? `Welcome, ${fullName || "Student"}!` : "Complete Your Profile"}
                </h4>
                <p className="text-[11px] text-[#1B4D3E]/80 mt-1 font-sans">
                  {isGoogleLogin 
                    ? "Your Google account has been authenticated successfully. Please confirm your name and enter your mobile contact number below to finalize setup."
                    : "Please enter your profile details below to complete your setup in CampusBites."}
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-0.5">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 outline-none rounded-2xl focus:border-black transition-all text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-0.5">
                  Mobile Contact Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="Enter your 10-digit mobile number"
                    value={contactNo}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setContactNo(val);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 outline-none rounded-2xl focus:border-black transition-all text-slate-900 focus:bg-white font-bold"
                  />
                </div>
              </div>

              <div id="locked-disclaimer" className="flex items-center gap-1.5 text-[9px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <Shield className="w-3.5 h-3.5 text-[#1B4D3E]" />
                <span>Notice: Profile is saved securely. Details can always be updated in your CampusBites Profile later.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-[#1B4D3E] hover:bg-[#2E7D5A] text-white text-xs font-bold py-3 px-4 rounded-xl active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Submit & Save Profile</span>
                    <ArrowRight className="w-4 h-4 animate-bounce" />
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      {/* High Fidelity Floating Push SMS Notification (Swiggy Style) */}
      <AnimatePresence>
        {showSmsSimulator && (
          <motion.div
            initial={{ opacity: 0, y: -100, x: "-50%", scale: 0.9 }}
            animate={{ opacity: 1, y: 16, x: "-50%", scale: 1 }}
            exit={{ opacity: 0, y: -100, x: "-50%", scale: 0.9 }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-[360px] bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-white/15"
          >
            <div className="flex items-start gap-3 text-left">
              <div className="p-2 bg-[#1B4D3E] rounded-xl text-white shrink-0 shadow-sm">
                <Phone className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black tracking-widest text-[#1B4D3E] uppercase">Messages</span>
                  <span className="text-[9px] text-slate-400 font-medium font-sans">now</span>
                </div>
                <p className="text-[11px] font-black text-white/95 mt-0.5 font-sans">Sphoorthy Canteen OTP</p>
                <p className="text-[11px] text-slate-200 mt-1 leading-relaxed font-mono font-medium break-words">
                  {simulatorMessage}
                </p>
                <div className="mt-3 flex justify-between items-center bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                  <span className="text-[9px] text-slate-400 font-sans">Copy phone OTP code</span>
                  <button 
                    type="button"
                    onClick={() => {
                      if (receivedOtp) {
                        setOtp(receivedOtp);
                        setShowSmsSimulator(false);
                      }
                    }}
                    className="text-[10px] font-extrabold text-[#1B4D3E] hover:underline focus:outline-none cursor-pointer font-sans"
                  >
                    Auto-Fill OTP
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* High Fidelity Floating Push Email Notification (Gmail Style) */}
      <AnimatePresence>
        {showEmailSimulator && (
          <motion.div
            initial={{ opacity: 0, y: -100, x: "-50%", scale: 0.9 }}
            animate={{ opacity: 1, y: 16, x: "-50%", scale: 1 }}
            exit={{ opacity: 0, y: -100, x: "-50%", scale: 0.9 }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-[360px] bg-red-950/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-red-500/20"
          >
            <div className="flex items-start gap-3 text-left">
              <div className="p-2.5 bg-red-600 rounded-xl text-white shrink-0 shadow-sm animate-pulse">
                <span className="text-sm">📧</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black tracking-widest text-red-450 uppercase font-sans">Gmail</span>
                  <span className="text-[9px] text-slate-300 font-medium font-sans">now</span>
                </div>
                <p className="text-[11px] font-black text-white/95 mt-0.5 font-sans">Sphoorthy Email Verification</p>
                <p className="text-[11px] text-slate-200 mt-1 leading-relaxed font-sans font-medium break-words">
                  {simulatorEmailMessage}
                </p>
                <div className="mt-3 flex justify-between items-center bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                  <span className="text-[9px] text-slate-300 font-sans">Verify your email registry</span>
                  <button 
                    type="button"
                    onClick={() => {
                      if (receivedOtp) {
                        setOtp(receivedOtp);
                        setShowEmailSimulator(false);
                      }
                    }}
                    className="text-[10px] font-extrabold text-red-400 hover:underline focus:outline-none cursor-pointer font-sans"
                  >
                    Auto-Fill OTP
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
