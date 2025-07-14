# Ruby Usage Examples

The `McpUiServer.create_ui_resource` method is the primary helper for building UI resource hashes.

## Creating a `rawHtml` resource

This is the simplest resource type, where you provide a raw HTML string.

```ruby
require 'mcp_ui_server'

resource = McpUiServer.create_ui_resource(
  uri: 'ui://my-app/greeting',
  content: {
    type: :rawHtml,
    htmlString: '<h1>Hello, World!</h1>'
  }
)

# The resulting resource hash can be serialized to JSON and sent in your API response.
# {
#   "type": "resource",
#   "resource": {
#     "uri": "ui://my-app/greeting",
#     "mimeType": "text/html",
#     "text": "<h1>Hello, World!</h1>"
#   }
# }
```

## Creating a `remoteDom` resource

For more complex and interactive UIs, you can use a `remoteDom` resource. This allows you to send a JavaScript bundle that will be executed on the client.

```ruby
require 'mcp_ui_server'

# It is assumed that you have a build process that generates this JavaScript bundle.
script = File.read('path/to/your/bundle.js')

resource = McpUiServer.create_ui_resource(
  uri: 'ui://my-app/complex-view',
  content: {
    type: :remoteDom,
    script: script,
    flavor: 'react' # or 'webcomponents'
  }
)
```

## Using `blob` delivery

For binary content or to avoid encoding issues, you can use `blob` delivery. This will Base64 encode the content, which can be useful for larger payloads or scripts.

```ruby
resource = McpUiServer.create_ui_resource(
  uri: 'ui://my-app/greeting',
  content: {
    type: :rawHtml,
    htmlString: '<h1>Hello, World!</h1>'
  },
  delivery: 'blob'
)
``` 