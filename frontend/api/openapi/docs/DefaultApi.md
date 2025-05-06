# DefaultApi

All URIs are relative to *http://localhost:3000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getUserInfo**](#getuserinfo) | **GET** /me | Get current user information|
|[**loginUser**](#loginuser) | **POST** /login | Login an existing user|
|[**registerUser**](#registeruser) | **POST** /register | Register a new user|
|[**sendCode**](#sendcode) | **POST** /send-code | Send a verification code to the user|
|[**sendNotification**](#sendnotification) | **POST** /send-notification | Send a notification (mocked)|
|[**updatePassword**](#updatepassword) | **POST** /reset-password | Verify the entered verification code and update the password|
|[**verifyUserCode**](#verifyusercode) | **POST** /verify-user-code | Verify the entered verification code and vrify the user|

# **getUserInfo**
> UserInfoResponse getUserInfo()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

const { status, data } = await apiInstance.getUserInfo();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**UserInfoResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | User information retrieved successfully |  -  |
|**401** | Unauthorized access |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **loginUser**
> LoginResponse loginUser(loginRequest)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    LoginRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let loginRequest: LoginRequest; //

const { status, data } = await apiInstance.loginUser(
    loginRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **loginRequest** | **LoginRequest**|  | |


### Return type

**LoginResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Login successful |  -  |
|**400** | Bad request due to validation errors |  -  |
|**401** | Unauthorized access |  -  |
|**500** | Internal server error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **registerUser**
> RegisterResponse registerUser(registerRequest)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    RegisterRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let registerRequest: RegisterRequest; //

const { status, data } = await apiInstance.registerUser(
    registerRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **registerRequest** | **RegisterRequest**|  | |


### Return type

**RegisterResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | User registered successfully |  -  |
|**400** | Bad request due to validation errors |  -  |
|**500** | Internal server error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sendCode**
> SendCodeResponse sendCode(sendCodeRequest)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    SendCodeRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let sendCodeRequest: SendCodeRequest; //

const { status, data } = await apiInstance.sendCode(
    sendCodeRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **sendCodeRequest** | **SendCodeRequest**|  | |


### Return type

**SendCodeResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Verification code sent successfully |  -  |
|**400** | Bad request due to validation errors |  -  |
|**500** | Internal server error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sendNotification**
> SendNotificationRequest sendNotification(sendNotificationRequest)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    SendNotificationRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let sendNotificationRequest: SendNotificationRequest; //

const { status, data } = await apiInstance.sendNotification(
    sendNotificationRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **sendNotificationRequest** | **SendNotificationRequest**|  | |


### Return type

**SendNotificationRequest**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Notification sent successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updatePassword**
> UpdatePasswordResponse updatePassword(updatePasswordRequest)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    UpdatePasswordRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let updatePasswordRequest: UpdatePasswordRequest; //

const { status, data } = await apiInstance.updatePassword(
    updatePasswordRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updatePasswordRequest** | **UpdatePasswordRequest**|  | |


### Return type

**UpdatePasswordResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Code verification successful and Password updated |  -  |
|**400** | Bad request due to validation errors |  -  |
|**401** | Unauthorized access |  -  |
|**500** | Internal server error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **verifyUserCode**
> VerifyUserCodeResponse verifyUserCode(verifyUserCodeRequest)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    VerifyUserCodeRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let verifyUserCodeRequest: VerifyUserCodeRequest; //

const { status, data } = await apiInstance.verifyUserCode(
    verifyUserCodeRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **verifyUserCodeRequest** | **VerifyUserCodeRequest**|  | |


### Return type

**VerifyUserCodeResponse**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Code verification successful |  -  |
|**400** | Bad request due to validation errors |  -  |
|**401** | Unauthorized access |  -  |
|**500** | Internal server error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

