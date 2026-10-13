'use client'
import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { fetchUserProfile } from '@/api/apiRoutes'
import { tokenSelector } from '@/redux/reducers/userSlice'

export const USER_PROFILE_QUERY_KEY = ['userProfile']

// Shared cache key so Layout/Header (and anyone else) dedupe into one request
// and skip refetching within staleTime instead of each firing its own call.
export const useUserProfileQuery = () => {
    const isLoggedIn = !!useSelector(tokenSelector)

    return useQuery({
        queryKey: USER_PROFILE_QUERY_KEY,
        queryFn: async () => (await fetchUserProfile()).data,
        enabled: isLoggedIn,
        staleTime: 60 * 60 * 1000,
        refetchInterval: 60 * 60 * 1000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    })
}
