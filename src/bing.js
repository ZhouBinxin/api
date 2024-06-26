// bing相关代码主程序
export async function bing (data, env) {
  if (data.action === 'img') {
    return await fetchBingImageUrl();
  }
}

async function fetchBingImageUrl () {
  const url = 'https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1';
  const res = await fetch(url);
  const data = await res.json();

  const imageUrl = 'https://global.bing.com' + data.images[0].url;
  return { imgurl: imageUrl };
}
