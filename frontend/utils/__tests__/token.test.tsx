// Import token functions dynamically in each test block to ensure mocks are applied correctly.
jest.unmock('../token');

const setupPlatformMock = (platform: 'web' | 'ios') => {
    jest.resetModules();
    const platformMock = jest.requireActual('react-native');
    platformMock.Platform.OS = platform;
    jest.doMock('react-native', () => platformMock);
};

const setupLocalStorageMock = (tokenObj: { token: string | null }) => {
    Object.defineProperty(window, 'localStorage', {
        value: {
            setItem: jest.fn((key, tkn) => (tokenObj.token = tkn)),
            getItem: jest.fn(() => tokenObj.token),
            removeItem: jest.fn(() => {
                tokenObj.token = null;
            }),
        },
        writable: true,
    });
};

const setupSecureStoreMock = (tokenObj: { token: string | null }, throwError = false) => {
    jest.doMock('expo-secure-store', () => ({
        setItemAsync: jest.fn((key, tkn) => {
            if (throwError) throw new Error('Failed to save token');
            tokenObj.token = tkn;
        }),
        getItemAsync: jest.fn(() => {
            if (throwError) throw new Error('Failed to get token');
            return tokenObj.token;
        }),
        deleteItemAsync: jest.fn(() => {
            if (throwError) throw new Error('Failed to remove token');
            tokenObj.token = null;
        }),
    }));
};

describe('Token Utility Functions', () => {
    const tokenObj = { token: null };

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('(Web)', () => {
        beforeAll(() => {
            setupPlatformMock('web');
            setupLocalStorageMock(tokenObj);
        });

        it('token in localStorage', async () => {
            const { getToken, saveToken, removeToken } = require('../token');
            console.log('getToken, saveToken, removeToken functions loaded:', { getToken, saveToken, removeToken });

            expect(await getToken()).toBe(null);
            expect(localStorage.getItem).toHaveBeenCalledWith('token');

            const token = 'test-token';
            await saveToken(token);
            expect(localStorage.setItem).toHaveBeenCalledWith('token', token);
            expect(tokenObj.token).toBe(token);

            expect(await getToken()).toBe(token);
            expect(localStorage.getItem).toHaveBeenCalledWith('token');

            await removeToken();
            expect(localStorage.removeItem).toHaveBeenCalledWith('token');
            expect(await getToken()).toBe(null);
        });
    });

    describe('(iOS)', () => {
        beforeAll(() => {
            setupPlatformMock('ios');
            setupSecureStoreMock(tokenObj);
        });

        test('token in SecureStore', async () => {
            const { getToken, saveToken, removeToken } = require('../token');

            expect(await getToken()).toBe(null);

            const token = 'test-token';
            await saveToken(token);
            expect(tokenObj.token).toBe(token);

            expect(await getToken()).toBe(token);

            await removeToken();
            expect(tokenObj.token).toBe(null);

            expect(await getToken()).toBe(null);
        });
    });

    describe('Handle errors in token functions properly', () => {
        beforeAll(() => {
            setupPlatformMock('ios');
            setupSecureStoreMock(tokenObj, true);
        });

        test('token in SecureStore with errors', async () => {
            const { getToken, saveToken, removeToken } = require('../token');

            expect(await getToken()).toBe(null);

            const token = 'test-token';
            await saveToken(token);

            expect(await getToken()).toBe(null);

            await removeToken();

            expect(await getToken()).toBe(null);
        });
    });
});
