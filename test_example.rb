#!/usr/bin/env ruby

require_relative 'lib/mcp_ui_server'

# Test the example from the documentation
resource = McpUiServer.create_ui_resource(
  uri: 'ui://my-app/greeting',
  content: {
    type: :rawHtml,
    htmlString: '<h1>Hello, World!</h1>'
  },
  delivery: :blob
)

puts 'Documentation example works!'
puts "Type: #{resource[:type]}"
puts "URI: #{resource[:resource][:uri]}"
puts "MimeType: #{resource[:resource][:mimeType]}"
puts "Has blob: #{resource[:resource].key?(:blob)}" 