export enum HCaptchaErrorCodes {
    MISSING_INPUT_SECRET = 'missing-input-secret',
    INVALID_INPUT_SECRET = 'invalid-input-secret',
    MISSING_INPUT_RESPONSE = 'missing-input-response',
    INVALID_INPUT_RESPONSE = 'invalid-input-response',
    BAD_REQUEST = 'bad-request',
    INVALID_OR_ALREADY_SEEN_RESPONSE = 'invalid-or-already-seen-response',
    NOT_USING_DUMMY_PASSCODE = 'not-using-dummy-passcode',
    SITEKEY_SECRET_MISMATCH = 'sitekey-secret-mismatch',
}
