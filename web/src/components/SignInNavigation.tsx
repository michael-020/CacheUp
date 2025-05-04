import { usePathStore } from "@/stores/PathStore/usePathStore";
import { Link, useLocation } from "react-router-dom"

const SignInNavigation = () => {
  const { setUserLastPath } = usePathStore();
  const location = useLocation();

  const handleSignIn = () => {
    const authPaths = ['/', '/signin', '/signup', '/verify-email'];
    if (!authPaths.includes(location.pathname)) {
      setUserLastPath(location.pathname);
    }
  };

  return (
    <div>
      <div className="flex flex-col items-center gap-4">
        <p>
          Sign In to view this page  
        </p>
        <Link 
          to="/signin" 
          className="text-blue-500 underline"
          onClick={handleSignIn}
        >
          Click here to sign-in
        </Link>
      </div>
    </div>
  )
}

export default SignInNavigation