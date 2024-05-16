export async function bingImg () {
  const url = 'https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1';
  const res = await fetch(url);
  const data = await res.json();

  return 'https://global.bing.com' + (data as any).images[0].url;
}