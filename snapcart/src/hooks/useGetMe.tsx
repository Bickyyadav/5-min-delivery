import { AppDispatch } from "@/redux/store";
import { setUserData } from "@/redux/userSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

function useGetMe(enabled: boolean) {
    const dispatch = useDispatch<AppDispatch>()
    useEffect(() => {
        if (!enabled) return
        let cancelled = false
        const getMe = async () => {
            try {
                const result = await axios.get("/api/me")
                if (!cancelled) {
                    dispatch(setUserData(result.data))
                }
                console.log("🚀 ~ getMe ~ result:", result)

            } catch (error) {
                console.log("🚀 ~ getMe ~ error:", error)

            }
        }
        getMe()
        return () => {
            cancelled = true
        }
    }, [enabled, dispatch])
}

export default useGetMe