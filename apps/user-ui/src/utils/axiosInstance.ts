import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true, // Include cookies in requests
});
let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

//handel logout and prevent infinite loops 
const handleLOgout = () => {
if (window.location.pathname !=="/login") {
    window.location.href = "/login";
}
};

//handel adding a new access token to queued requests
const subscribeTokenRefresh = (callback: () => void) => {
    refreshSubscribers.push(callback);
};

//execute all queued requests after  refreshe
const onRefreshSucess = () => {
    refreshSubscribers.forEach((callback) => callback());
    refreshSubscribers = [];
}   ;

//handel the API requests
axiosInstance.interceptors.response.use(
    (config)=> config,
    (error) => Promise.reject(error)
);

// Handel expire token and refresh logic

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // prevent infinite retry  loop
        if (error.response?.status === 401 && !originalRequest._retry) {
            if(isRefreshing){
                return new Promise((resolve) => {
                    subscribeTokenRefresh(() => {
                        resolve(axiosInstance(originalRequest));
                    });
                });
    }
    originalRequest._retry = true;
    isRefreshing = true;
    
    try {
        await axiosInstance.post(`$process.env.NEXT_PUBLIC_API_URL}/api/refresh-token-user`,
            {},
            { withCredentials: true }
        );

        isRefreshing = false;
        onRefreshSucess();
        return axiosInstance(originalRequest);
    } catch (error) {
        isRefreshing = false;
        refreshSubscribers = [];
        handleLOgout();
        return Promise.reject(error);   

    }

}
return Promise.reject(error);
    }
);




export default axiosInstance;
