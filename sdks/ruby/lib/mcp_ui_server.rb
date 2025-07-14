# frozen_string_literal: true

require_relative 'mcp_ui_server/version'
require 'base64'

# The McpUiServer module provides helper methods for creating UI resources
# compatible with the Model Context Protocol UI (mcp-ui) client.
module McpUiServer
  class Error < StandardError; end

  # Creates a UIResource hash structure for an MCP response.
  # This structure can then be serialized to JSON by your web framework.
  #
  # @param uri [String] The unique identifier for the resource (e.g., 'ui://greeting/1').
  # @param content [Hash] A hash describing the UI content.
  #   - :type [Symbol] The type of content. One of :rawHtml, :externalUrl, or :remoteDom.
  #   - :htmlString [String] The raw HTML content (required if type is :rawHtml).
  #   - :iframeUrl [String] The URL for an external page (required if type is :externalUrl).
  #   - :script [String] The remote-dom script (required if type is :remoteDom).
  #   - :flavor [String] The remote-dom flavor, e.g., 'react' or 'webcomponents' (optional, for :remoteDom).
  # @param delivery [String] The delivery method. 'text' for plain string, 'blob' for base64 encoded.
  #
  # @return [Hash] A UIResource hash ready to be included in an MCP response.
  #
  # @raise [ArgumentError] if content type or delivery type is unknown, or if required content keys are missing.
  def self.create_ui_resource(uri:, content:, delivery: 'text')
    resource = { uri: uri }

    content_value = process_content(content, resource)
    process_delivery(delivery, resource, content_value)

    {
      type: 'resource',
      resource: resource
    }
  end

  # private

  def self.process_content(content, resource)
    case content.fetch(:type)
    when :rawHtml
      process_raw_html_content(content, resource)
    when :externalUrl
      process_external_url_content(content, resource)
    when :remoteDom
      process_remote_dom_content(content, resource)
    else
      raise ArgumentError, "Unknown content type: #{content[:type]}"
    end
  end
  private_class_method :process_content

  def self.process_raw_html_content(content, resource)
    resource[:mimeType] = 'text/html'
    content.fetch(:htmlString)
  end
  private_class_method :process_raw_html_content

  def self.process_external_url_content(content, resource)
    resource[:mimeType] = 'text/uri-list'
    content.fetch(:iframeUrl)
  end
  private_class_method :process_external_url_content

  def self.process_remote_dom_content(content, resource)
    flavor = content.fetch(:flavor, 'react')
    resource[:mimeType] = "application/vnd.mcp-ui.remote-dom; flavor=#{flavor}"
    content.fetch(:script)
  end
  private_class_method :process_remote_dom_content

  def self.process_delivery(delivery, resource, content_value)
    case delivery
    when 'text'
      resource[:text] = content_value
    when 'blob'
      resource[:blob] = Base64.strict_encode64(content_value)
    else
      raise ArgumentError, "Unknown delivery type: #{delivery}"
    end
  end
  private_class_method :process_delivery
end
