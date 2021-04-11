const fs = require('fs');
const chapters_name_list = require(global.appRoot + '/files/naruto_mangas.json');

getFile = (value_formatted) => {
  return fs.readFileSync(global.appRoot + `/files/covers/${value_formatted}.${getFileExtension(value_formatted)}`, { encoding: 'base64' });
}

getChapterTitle = (chapter) => {
  return chapters_name_list.find(x => x.chapter === chapter).text;
}

getFileExtension = (entry) => {
  const files = fs.readdirSync(appRoot + '/files/covers');
  const filename = files.find((file) => {
    return file.includes(entry);
  });

  const extension = filename.split(".").pop();

  return extension;
}

module.exports = {
  getFile,
  getChapterTitle,
  getFileExtension
};