# QCloudCOSWebpackPlugin

![](https://img.shields.io/npm/v/qcloud-cos-webpack-plugin?style=flat-square&link=https://www.npmjs.com/package/qcloud-cos-webpack-plugin)

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
