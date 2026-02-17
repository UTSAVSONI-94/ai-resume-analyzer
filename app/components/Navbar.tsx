import { Link, useLocation } from "react-router";
import { usePuterStore } from "~/lib/puter";

const Navbar = () => {
    const { auth, isLoading } = usePuterStore();
    const location = useLocation();

    return (
        <nav className="navbar backdrop-blur-md bg-[#0f1629]/90 shadow-lg shadow-black/10 border border-[#2d3a4f]/50">
            <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg primary-gradient flex items-center justify-center">
                    <span className="text-white text-sm font-bold">R</span>
                </div>
                <p className="text-xl font-bold text-gradient">RESUMIND</p>
            </Link>
            <div className="flex items-center gap-1">
                <Link to="/dashboard" className={`text-sm font-medium px-3 py-1.5 rounded-full transition-all duration-300 ${location.pathname === '/dashboard' ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-400 hover:text-gray-200 hover:bg-[#2d3a4f]'}`}>
                    Dashboard
                </Link>
                <Link to="/compare" className={`text-sm font-medium px-3 py-1.5 rounded-full transition-all duration-300 ${location.pathname === '/compare' ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-400 hover:text-gray-200 hover:bg-[#2d3a4f]'}`}>
                    Compare
                </Link>
                <Link to="/tailor" className={`text-sm font-medium px-3 py-1.5 rounded-full transition-all duration-300 ${location.pathname === '/tailor' ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-400 hover:text-gray-200 hover:bg-[#2d3a4f]'}`}>
                    Tailor
                </Link>
                <Link to="/cover-letter" className={`text-sm font-medium px-3 py-1.5 rounded-full transition-all duration-300 ${location.pathname === '/cover-letter' ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-400 hover:text-gray-200 hover:bg-[#2d3a4f]'}`}>
                    Cover Letter
                </Link>
                <Link to="/interview" className={`text-sm font-medium px-3 py-1.5 rounded-full transition-all duration-300 ${location.pathname === '/interview' ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-400 hover:text-gray-200 hover:bg-[#2d3a4f]'}`}>
                    Interview
                </Link>
                {location.pathname !== '/upload' && (
                    <Link to="/upload" className="primary-button w-fit text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 ml-1">
                        Upload Resume
                    </Link>
                )}
                {!isLoading && (
                    auth.isAuthenticated ? (
                        <button onClick={auth.signOut} className="text-sm font-medium text-gray-500 hover:text-red-400 transition-all duration-300 cursor-pointer px-3 py-1.5 rounded-full hover:bg-red-500/10">
                            Log Out
                        </button>
                    ) : (
                        <Link to="/auth?next=/" className="text-sm font-medium text-gray-400 hover:text-indigo-400 transition-all duration-300 px-3 py-1.5 rounded-full hover:bg-indigo-500/10">
                            Log In
                        </Link>
                    )
                )}
            </div>
        </nav>
    )
}
export default Navbar
