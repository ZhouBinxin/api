// bing相关代码主程序
export async function bing (data, env) {
  if (data.action === 'img') {
    return await fetchBingImageData();
  }
}

async function fetchBingImageData () {
  const url = 'https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1';
  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const imageUrl = 'https://global.bing.com' + data.images[0].url;
    return { imgurl: imageUrl, status: res.status }; // 返回图片URL和状态码
  } catch (error) {
    console.error('Fetch error:', error);
    return { error: error.message, status: 500 }; // 如果出现错误，返回错误消息和状态码
  }
}
