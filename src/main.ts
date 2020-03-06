import * as https from 'https'
import * as querystring from 'querystring'
import md5 = require('md5')
import { appid, appSecret } from './private'

type baiduResult = {
  error_code?: string,
  error_msg?: string,
  from: string,
  to: string,
  trans_result: { src: string, dst: string }[]
}

export const translate = (word) => {
  const salt = Math.random()
  const sign = md5(appid + word + salt + appSecret)

  const query = querystring.stringify({
    q: word,
    from: 'en',
    to: 'zh',
    appid: appid,
    salt: salt,
    sign: sign
  });

  const options = {
    hostname: 'api.fanyi.baidu.com',
    port: 443,
    path: '/api/trans/vip/translate?' + query,
    method: 'GET'
  };

  const request = https.request(options, (response) => {
    let array = []

    response.on('data', (chunk) => {
      array.push(chunk)
    });

    response.on('end', () => {
      const resultObject: baiduResult = JSON.parse(Buffer.concat(array).toString())
      const { error_code, error_msg, trans_result } = resultObject
      if (error_code) {
        console.log(error_msg)
        process.exit(2)
      } else {
        console.log(trans_result[0].dst)
        process.exit(0)
      }
    })
  });

  request.on('error', (e) => {
    console.error(e);
  });

  request.end();
}