# QCloudCOSWebpackPlugin

## Configuration

Options: 

| Params |
|---:|
| SecretId |
| SecretKey |
| Bucket |
| Region |

example:
```javascript
const QCloudCOSWebpackPlugin = require('qcloud-cos-webpack-plugin');

...

module.exports = {
    plugins: [
        ...,

        new QCloudCOSWebpackPlugin({
            SecretId: `xxx`,
            SecretKey: `xxx`,
            Bucket: `xxx`,
            Region: `xxx`,
        }),
    ]
}
```
