const fs = require('fs');
const path = require('path');

const initialConfig = {
  extensions: ['.js'],
};

module.exports = (_module, config = initialConfig) => {
  const { extensions } = { ...initialConfig, ...config },
    basedir = path.dirname(_module.filename);

  // This function will loop over the directory's tree.
  return (addFile = (dir = '') => {
    // Get every files in the 'basedir' and filter them.
    const files = fs
      .readdirSync(path.join(basedir, dir), {
        withFileTypes: true
      })
      .filter(
        file =>
          // If file is not a directory and as a valid extension.
          (extensions.find(type => type === `.${file.name.split('.').pop()}`) &&
            !file.isDirectory()) ||
          // If file is a directory.
          file.isDirectory()
      );

    // Return the final object.
    return files.reduce((acc, file) => {
      const { name } = file;

      // Don't import the file were this function as been called.
      if (path.join(basedir, name) === _module.filename) return { ...acc };

      // If file is a directory, start this function again with a new path.
      if (file.isDirectory())
        return { ...acc, [name]: addFile(path.join(dir, name), config) };

      // Remove the file extension if the extension is in config.extension.
      const finalName = name
        .split(
          new RegExp(
            `${['.js', '.json'].reduce(
              (acc, curr) => (acc ? `${acc}|${curr}` : curr),
              ''
            )}$`
          )
        )
        .join('');

      // If the fileName is 'index' and there's no other files, return hes content.
      if (finalName === 'index' && files.length <= 1)
        return require(path.join(basedir, dir, name));

      // Return the file's content in a new property of the final object.
      return {
        ...acc,
        [finalName]: require(path.join(basedir, dir, name))
      };
    }, {});
  })();
};
