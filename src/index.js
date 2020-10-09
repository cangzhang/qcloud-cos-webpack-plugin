const fs = require('fs');
const md5File = require('md5-file');
const COS = require('cos-nodejs-sdk-v5');
const chalk = require('chalk');

const PluginName = `QCloudCOSWebpackPlugin`;

module.exports = class QCloudCOSWebpackPlugin {
  constructor(_options) {
    const options = {
      ..._options,
    };
    this.cosOptions = options;
    this.cos = new COS(options);
  }

  async getAssetInfo(fileName, outputPath) {
    try {
      const fullPath = `${outputPath}/${fileName}`;
      const hash = await md5File(fullPath);
      return {
        Key: fileName,
        ETag: hash,
      };
    } catch (err) {
      throw new Error(err);
    }
  }

  getCOSFiles() {
    const {Bucket, Region, Prefix} = this.cosOptions;
    return new Promise((resolve, reject) => {
      this.cos.getBucket(
        {
          Bucket,
          Region,
          Prefix,
        },
        function (err, data) {
          if (err) {
            return reject(err);
          }
          resolve(data);
        }
      );
    });
  }

  uploadFiles(fileName, outputPath) {
    const fullPath = `${outputPath}/${fileName}`;
    return new Promise((resolve, reject) => {
      this.cos.putObject(
        {
          ...this.cosOptions,
          Bucket: this.cosOptions.Bucket,
          Region: this.cosOptions.Region,
          Key: `${this.cosOptions.Prefix}/${fileName}`,
          StorageClass: 'STANDARD',
          Body: fs.createReadStream(fullPath),
        },
        function (err, data) {
          if (err) {
            return reject(err);
          }

          console.log(chalk.blue(`[${PluginName}]: Uploaded ${fileName}`));
          resolve(data);
        }
      );
    });
  }

  filterExisted(assetMap = [], contents = []) {
    const files = assetMap.reduce((result, i) => {
      const existed = contents.some(
        (c) => c.Key === `${this.cosOptions.Prefix}/${i.Key}` && c.ETag === `"${i.ETag}"`
      );
      if (!existed) {
        console.info(chalk.yellow(`[${PluginName}] Ready to push: ${i.Key}`));
        result.push(i);
      }

      return result;
    }, []);

    return files;
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tap(PluginName, async (compilation) => {
      try {
        const assets = compilation.getAssets();
        const outputPath = compiler.options.output.path;

        const fileTasks = assets.map((i) => {
          const fileName = i.name;
          return this.getAssetInfo(fileName, outputPath);
        });

        const assetMap = await Promise.all(fileTasks);
        const data = await this.getCOSFiles();

        let files = this.filterExisted(assetMap, data.Contents);
        if (this.cosOptions.ignoreExisting) {
          console.log(chalk.red(`[${PluginName}]: ignore all existing cdn files.`));
          files = assetMap;
        }

        const uploadTasks = files.map((i) => this.uploadFiles(i.Key, outputPath));
        await Promise.all(uploadTasks);

        console.log(chalk.green(`[${PluginName}] All files uploaded successfully.`));
      } catch (e) {
        throw new Error(e);
      }
    });
  }
};
