# MCP UI Server SDK for Ruby

This is the Ruby server-side SDK for MCP UI. It provides helper methods to create UI resources that can be sent to the mcp-ui client.

## Installation

Add this line to your application's Gemfile:

```ruby
gem 'mcp_ui_server', git: 'https://github.com/idosal/mcp-ui', branch: 'feat/ruby'
```

And then execute:

    $ bundle install

## Usage

The main method is `McpUiServer.create_ui_resource`. It helps you construct a valid UIResource hash.

### Creating a `rawHtml` resource

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

### Creating a `remoteDom` resource

```ruby
require 'mcp_ui_server'

script = "..." # Your javascript bundle for the remote-dom
resource = McpUiServer.create_ui_resource(
  uri: 'ui://my-app/complex-view',
  content: {
    type: :remoteDom,
    script: script,
    flavor: 'react' # or 'webcomponents'
  }
)
```

### Using `blob` delivery

For binary content or to avoid encoding issues, you can use `blob` delivery, which will Base64 encode the content.

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

## Development

After checking out the repo, run `bundle install` to install dependencies. Then, run `bundle exec rspec` to run the tests. You can also run `bundle exec rubocop` to check for code style.

To install this gem onto your local machine, run `bundle exec rake install`.

### Caching

This SDK does not provide any caching mechanism out of the box. The `create_ui_resource` method is a simple and fast hash builder. If you find yourself creating the same resource multiple times with the same arguments, you might want to implement caching on your application side. For example, you could use `Rails.cache` to store the generated resource hash.

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/idosal/mcp-ui.

## License

The gem is available as open source under the terms of the [Apache-2.0 License](https://www.apache.org/licenses/LICENSE-2.0). 