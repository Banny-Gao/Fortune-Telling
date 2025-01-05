import { load } from '@amap/amap-jsapi-loader'
import { getWindow } from './browser'

declare global {
  interface Window {
    _AMapSecurityConfig: {
      securityJsCode: string
    }
  }
}

;(getWindow() as Window)._AMapSecurityConfig = {
  securityJsCode: 'da44670b52fc3896d170116c609c0e6e',
}

// 高德地图类型定义
interface AMapType {
  plugin: (plugins: string[], callback: () => void) => void
  Geocoder: new (options: GeocodeOptions) => Geocoder
  Geolocation: new (options: GeolocationOptions) => Geolocation
}

interface GeocodeOptions {
  extensions: 'all' | 'base'
}

interface GeolocationOptions {
  enableHighAccuracy: boolean
  timeout: number
  maximumAge: number
  convert: boolean
  noIpLocate: number
  extensions: 'all' | 'base'
}

interface Geocoder {
  getLocation: (address: string, callback: (status: 'complete' | 'error' | 'no_data', result: GeocodeResult) => void) => void
}

interface Geolocation {
  getCurrentPosition: (callback: (status: 'complete' | 'error', result: GeolocationResult) => void) => void
}

interface GeocodeResult {
  geocodes: {
    formattedAddress: string
    addressComponent: {
      province: string
      city: string
      district: string
    }
    location: {
      lng: number
      lat: number
    }
  }[]
}

interface GeolocationResult {
  position: {
    lng: number
    lat: number
  }
}

let AMap: AMapType | undefined
let Geocoder: Geocoder | undefined
let Geolocation: Geolocation | undefined

export enum PlaceSearchType {
  District = '地名地址信息;普通地名;区县级地名',
  City = '地名地址信息;普通地名;地市级地名',
  Province = '地名地址信息;普通地名;省级地名',
}

/** 加载地图 */
const loadMap = (): Promise<void> =>
  new Promise((resolve, reject) => {
    void load({
      key: '3079f13872097a6b4dd9f78a9728f0d8',
      version: '2.0',
    })
      .then((AMapInstance: AMapType) => {
        AMap = AMapInstance

        AMap.plugin(['AMap.Geocoder', 'AMap.Geolocation'], () => {
          if (!AMap) return

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
          resolve()
        })
      })
      .catch(reject)
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
export const getLocation = (address: string): Promise<PlaceSearchResult> =>
  new Promise((resolve, reject) => {
    void (async () => {
      if (!Geocoder) {
        try {
          await loadMap()
        } catch (error) {
          reject(new Error('Failed to initialize map'))
          return
        }
      }

      if (!Geocoder) {
        reject(new Error('Failed to initialize Geocoder'))
        return
      }

      Geocoder.getLocation(address, (status, result) => {
        if (status === 'complete' && result.geocodes.length > 0) {
          const geocode = result.geocodes[0]
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
    })()
  })

/** 定位当前位置 */
export const getCurrentLoc = (): Promise<Loc> =>
  new Promise((resolve, reject) => {
    void (async () => {
      if (!Geolocation) {
        try {
          await loadMap()
        } catch (error) {
          reject(new Error('Failed to initialize map'))
          return
        }
      }

      if (!Geolocation) {
        reject(new Error('Failed to initialize Geolocation'))
        return
      }

      Geolocation.getCurrentPosition((status, result) => {
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
    })()
  })
