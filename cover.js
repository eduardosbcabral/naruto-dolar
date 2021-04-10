const puppeteer = require('puppeteer');
const fs = require('fs');
const request = require('request');

const chapter_list_page_url = 'https://unionmangas.top/perfil-manga/naruto';

const cover_folder = './covers/';

const beginAt = '700';

openBrowser = async () => {
  const browser = await puppeteer.launch({
    product: 'chrome',
    headless: false
  });

  const page = await browser.newPage();

  await page.setDefaultNavigationTimeout(15000);
  await page.goto(chapter_list_page_url, {waitUntil: 'domcontentloaded'});

  const chapters_urls_list = await getChaptersUrls(page);

  for(const chapter_object of chapters_urls_list) {
    const { name, href } = chapter_object;
    console.log(chapter_object);
    if(name > beginAt)  
      continue;

    console.log('Going to url: ', href);
    await page.goto(href, {waitUntil: 'domcontentloaded'});
    const cover_url = await getCoverImageUrl(page);
    const cover_file_name = await formatCoverFileName(cover_url);
    await downloadImage(cover_url, (cover_folder + cover_file_name), () => {
      console.log(`Chapter ${cover_file_name} cover downloaded.`);
    });
  }
}

getChaptersUrls = async (page) => {
  const chapters_urls_list = await page.evaluate(
    () => Array.from(
      document.querySelectorAll('.row .lancamento-linha div:first-of-type a'),
      a => {
        return {
          name: parseInt(a.innerHTML.split('Cap. ')[1]),
          href: a.getAttribute('href')
        }
      }
    )
  );

  return chapters_urls_list;
}

getCoverImageUrl = async (page) => {
  const cover_url = await page.evaluate(() => {
    const image_element = document.querySelectorAll('.container.backTop .row .col-sm-12.text-center img')[3];
    return image_element.getAttribute('src');
  });
  console.log('Cover URL: ', cover_url);
  return cover_url;
}

downloadImage = async(url, fileName, callback) => {
  request.head(url, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(url).pipe(fs.createWriteStream(fileName)).on('close', callback);
  });
}

formatCoverFileName = async (url) => {
  const splitted = url.split('/');
  const splittedPerDot = url.split('.');
  return `${splitted[splitted.length-2]}.${splittedPerDot[splittedPerDot.length-1]}`;
}

delay = (time) => {
  return new Promise(function(resolve) { 
    setTimeout(resolve, time)
  });
}

openBrowser();