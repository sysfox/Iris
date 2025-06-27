import { merge } from 'es-toolkit/compat'

const defaultInjectConfig = {
  useApi: false,
}

export const injectConfig = merge(defaultInjectConfig, __CONFIG__)
