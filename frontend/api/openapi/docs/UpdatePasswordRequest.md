# UpdatePasswordRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**mobile** | **string** | The mobile of the user who is verifying the code. | [default to undefined]
**code** | **string** | The 6-digit verification code to be verified. | [default to undefined]
**newPassword** | **string** | The new password to be updated. | [default to undefined]

## Example

```typescript
import { UpdatePasswordRequest } from './api';

const instance: UpdatePasswordRequest = {
    mobile,
    code,
    newPassword,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
