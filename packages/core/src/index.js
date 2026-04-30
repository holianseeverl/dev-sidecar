/**
 * dev-sidecar core module
 * Main entry point for the core package
 */

'use strict'

const proxyServer = require('./proxy/server')
const dnsServer = require('./dns/server')
const config = require('./config')
const log = require('./utils/logger')

/**
 * DevSidecar core instance
 */
const DevSidecar = {
  /**
   * Initialize the core module with optional config overrides
   * @param {object} options - Configuration options
   */
  async init (options = {}) {
    log.info('DevSidecar core initializing...')
    await config.load(options)
    log.info('Config loaded:', config.get())
  },

  /**
   * Start all services (proxy + DNS)
   */
  async startup () {
    log.info('Starting DevSidecar services...')

    try {
      await this.startProxy()
      await this.startDns()
      log.info('All services started successfully')
    } catch (err) {
      log.error('Failed to start services:', err)
      throw err
    }
  },

  /**
   * Start the proxy server
   */
  async startProxy () {
    const proxyConfig = config.get('proxy')
    await proxyServer.start(proxyConfig)
    log.info(`Proxy server started on port ${proxyConfig.port}`)
  },

  /**
   * Start the DNS server
   */
  async startDns () {
    const dnsConfig = config.get('dns')
    if (!dnsConfig.enabled) {
      log.info('DNS server is disabled, skipping')
      return
    }
    await dnsServer.start(dnsConfig)
    log.info(`DNS server started on port ${dnsConfig.port}`)
  },

  /**
   * Stop all services gracefully
   */
  async shutdown () {
    log.info('Shutting down DevSidecar services...')

    try {
      await proxyServer.stop()
      await dnsServer.stop()
      log.info('All services stopped')
    } catch (err) {
      log.error('Error during shutdown:', err)
      throw err
    }
  },

  /**
   * Get current status of all services
   * @returns {object} Status object
   */
  status () {
    return {
      proxy: proxyServer.status(),
      dns: dnsServer.status(),
      config: config.get()
    }
  },

  /**
   * Reload configuration and restart services if needed
   * @param {object} newConfig - New configuration to apply
   */
  async reloadConfig (newConfig = {}) {
    log.info('Reloading configuration...')
    await config.reload(newConfig)
    log.info('Configuration reloaded')
  }
}

module.exports = DevSidecar
