declare global {
  interface Window {
    _AMapSecurityConfig: {
      securityJsCode: string
    }
  }
}

import AMapLoader from '@amap/amap-jsapi-loader'

let AMap: any, Geocoder: any, Geolocation: any

window._AMapSecurityConfig = {
  securityJsCode: 'da44670b52fc3896d170116c609c0e6e',
}

export enum PlaceSearchType {
  District = '地名地址信息;普通地名;区县级地名',
  City = '地名地址信息;普通地名;地市级地名',
  Province = '地名地址信息;普通地名;省级地名',
}

/** 加载地图 */
const loadMap = () =>
  new Promise(async resolve => {
    AMap = await AMapLoader.load({
      key: '3079f13872097a6b4dd9f78a9728f0d8',
      version: '2.0',
    })

    AMap.plugin(['AMap.Geocoder', 'AMap.Geolocation'], () => {
      Geocoder = new AMap.Geocoder({
        extensions: 'all',
      })
      Geolocation = new AMap.Geolocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        convert: true,
        noIpLocate: 3,
        extensions: 'all',
      })
      resolve(true)
    })
  })

export interface Loc {
  lng: number
  lat: number
}

/** 地理编码结果 */
export interface PlaceSearchResult extends Loc {
  province: string
  city: string
  district: string
  formattedAddress: string
}

/** 获取地址的地理编码 */
export const getLocation = (address: string) =>
  new Promise<PlaceSearchResult>(async (resolve, reject) => {
    if (!Geocoder) await loadMap()

    Geocoder.getLocation(address, (status: any, result: any) => {
      if (status === 'complete') {
        const [geocode] = result.geocodes
        if (!geocode) return reject(new Error('Failed to get location'))

        const {
          formattedAddress,
          addressComponent: { province, city, district },
          location: { lng, lat },
        } = geocode

        resolve({
          province,
          city,
          district,
          formattedAddress,
          lng,
          lat,
        })
      } else {
        reject(new Error('Failed to get location'))
      }
    })
  })

/** 定位当前位置 */
export const getCurrentLoc = () =>
  new Promise<Loc>(async (resolve, reject) => {
    if (!Geolocation) await loadMap()

    Geolocation.getCurrentPosition(async (status: any, result: any) => {
      if (status === 'complete') {
        const {
          position: { lng, lat },
        } = result

        resolve({
          lng,
          lat,
        })
      } else {
        reject(new Error('Failed to get location'))
      }
    })
  })
