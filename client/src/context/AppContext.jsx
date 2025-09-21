import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth, useUser } from "@clerk/clerk-react";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const { user } = useUser();
    const { getToken } = useAuth();

    const [searchFilter, setSearchFilter] = useState({ title: '', location: '' });
    const [isSearched, setIsSearched] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [showRecruiterLogin, setShowRecruiterLogin] = useState(false);
    const [companyToken, setCompanyToken] = useState(null);
    const [companyData, setCompanyData] = useState(null);
    const [userData, setUserData] = useState(null);
    const [userApplications, setUserApplications] = useState([]);

    // ------------------- GET REQUESTS ------------------- //

    // Fetch all jobs
    const fetchJobs = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/jobs`);
            if (data.success) setJobs(data.jobs);
            else toast.error(data.message);
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Fetch company data
    const fetchCompanyData = async () => {
        if (!companyToken) return;
        try {
            const { data } = await axios.get(`${backendUrl}/api/company/company`, {
                headers: { token: companyToken }
            });
            if (data.success) setCompanyData(data.company);
            else toast.error(data.message);
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Fetch user data
    const fetchUserData = async () => {
        if (!user) return;
        try {
            const token = await getToken();
            const { data } = await axios.get(`${backendUrl}/api/users/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) setUserData(data.user);
            else toast.error(data.message);
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Fetch user's applied jobs
    const fetchUserApplications = async () => {
        if (!user) return;
        try {
            const token = await getToken();
            const { data } = await axios.get(`${backendUrl}/api/users/applications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) setUserApplications(data.applications);
            else toast.error(data.message);
        } catch (error) {
            toast.error(error.message);
        }
    };

    // ------------------- POST REQUESTS ------------------- //

    // Apply for a job
    const applyForJob = async (jobId, resumeFile) => {
        if (!user) return;
        try {
            const token = await getToken();
            const formData = new FormData();
            formData.append('jobId', jobId);
            if (resumeFile) formData.append('resume', resumeFile);

            const { data } = await axios.post(`${backendUrl}/api/users/apply`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (data.success) {
                toast.success("Applied successfully!");
                fetchUserApplications(); // refresh user's applied jobs
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Update user resume/profile
    const updateResume = async (resumeFile) => {
        if (!user) return;
        try {
            const token = await getToken();
            const formData = new FormData();
            formData.append('resume', resumeFile);

            const { data } = await axios.post(`${backendUrl}/api/users/update-resume`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (data.success) {
                toast.success("Resume updated successfully!");
                fetchUserData(); // refresh user data
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // ------------------- EFFECTS ------------------- //

    // Initial fetch
    useEffect(() => {
        fetchJobs();
        const storedCompanyToken = localStorage.getItem('companyToken');
        if (storedCompanyToken) setCompanyToken(storedCompanyToken);
    }, []);

    // Fetch company data when token is available
    useEffect(() => {
        fetchCompanyData();
    }, [companyToken]);

    // Fetch user data and applications when logged in
    useEffect(() => {
        fetchUserData();
        fetchUserApplications();
    }, [user]);

    // ------------------- CONTEXT VALUE ------------------- //

    const value = {
        setSearchFilter, searchFilter,
        isSearched, setIsSearched,
        jobs, setJobs,
        showRecruiterLogin, setShowRecruiterLogin,
        companyToken, setCompanyToken,
        companyData, setCompanyData,
        backendUrl,
        userData, setUserData,
        userApplications, setUserApplications,
        fetchUserData,
        fetchUserApplications,
        applyForJob,
        updateResume,
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};
