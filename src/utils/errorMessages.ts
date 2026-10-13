export const AUTH_ERROR_MESSAGES: Record<string, string> = {
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/email-already-in-use': 'An account already exists with this email.',
    'auth/weak-password': 'Password is too weak. Use at least 8 characters.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled.',
    'auth/account-exists-with-different-credential': 'An account already exists with the same email using a different sign-in method.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
    'auth/invalid-verification-code': 'The verification code you entered is invalid.',
    'auth/code-expired': 'This code has expired. Please request a new one.',
    'auth/missing-verification-code': 'Please enter the verification code.',
    'auth/invalid-phone-number': 'Please enter a valid phone number.',
    'auth/quota-exceeded': 'SMS quota exceeded. Please try again later.',
    'auth/requires-recent-login': 'Please log in again to continue.',
    'auth/credential-already-in-use': 'This account is already linked to another user.',
    'auth/expired-action-code': 'This link has expired. Please request a new one.',
    'auth/invalid-action-code': 'This link is invalid or has already been used.',
}

export const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.'

interface ApiLikeError {
    code?: string
    response?: { data?: { message?: string } }
}

export const getErrorMessage = (error: unknown, fallback: string = DEFAULT_ERROR_MESSAGE): string => {
    const err = error as ApiLikeError

    if (err?.code === 'ECONNABORTED') {
        return 'The server took too long to respond. Please try again in a moment.'
    }

    if (err?.response?.data?.message) {
        return err.response.data.message
    }

    if (err?.code && AUTH_ERROR_MESSAGES[err.code]) {
        return AUTH_ERROR_MESSAGES[err.code]
    }

    return fallback
}
