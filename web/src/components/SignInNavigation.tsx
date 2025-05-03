import { Link } from "react-router-dom"

const SignInNavigation = () => {
  return (
    <div>
        <div className="flex flex-col items-center gap-4">
          <p>
            Sign In to view this page  
          </p>
          <Link to="/signin" className="text-blue-500 underline">
            Click here to sign-in
          </Link>
        </div>
    </div>
  )
}

export default SignInNavigation