export async function bingImg () {
  const url = 'https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1';
  const res = await fetch(url);
  const data = await res.json();

  // 构建返回json数据
  return {
    url: 'https://global.bing.com' + data.images[0].url
  };
}